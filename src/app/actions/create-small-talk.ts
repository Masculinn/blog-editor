"use server";

import {
  createIdentityToken,
  getRequestIdentity,
  IDENTITY_COOKIE_NAME,
  verifyIdentityToken,
} from "@/lib/auth";
import { db } from "@/lib/db/server";
import {
  MAX_TITLE_LENGTH,
  validateDocument,
} from "@/lib/small-talk-validation";
import { createSmallTalk } from "@/utils/db/create-small-talk";
import type { SerializedDocument } from "@lexical/file";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

const MAX_CONTENT_HASH_LENGTH = 65_536;
const MAX_POSTS_PER_USER = 3;
const IDENTITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type CreateSmallTalkResult =
  | {
      success: true;
      id: string;
    }
  | {
      success: false;
      message: string;
    };

function isValidContentHash(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("#doc=") &&
    value.length > "#doc=".length &&
    value.length <= MAX_CONTENT_HASH_LENGTH
  );
}

export async function createSmallTalkAction(
  document: SerializedDocument,
  title: string,
): Promise<CreateSmallTalkResult> {
  if (typeof title !== "string" || !title.trim()) {
    return {
      success: false,
      message: "A title is required.",
    };
  }

  const normalizedTitle = title.trim();

  if (normalizedTitle.length > MAX_TITLE_LENGTH) {
    return {
      success: false,
      message: `The title cannot exceed ${MAX_TITLE_LENGTH} characters.`,
    };
  }

  const validationError = validateDocument(document);

  if (validationError) {
    return {
      success: false,
      message: validationError,
    };
  }

  try {
    const [requestHeaders, cookieStore] = await Promise.all([
      headers(),
      cookies(),
    ]);

    const identity = getRequestIdentity(requestHeaders);

    if (!identity.ip || !identity.userAgent) {
      return {
        success: false,
        message: "Request identity could not be determined.",
      };
    }

    const existingToken = cookieStore.get(IDENTITY_COOKIE_NAME)?.value;

    let verifiedIdentity = existingToken
      ? await verifyIdentityToken(existingToken, identity)
      : null;

    if (!verifiedIdentity) {
      const token = await createIdentityToken(identity);

      verifiedIdentity = await verifyIdentityToken(token, identity);

      if (!verifiedIdentity) {
        console.error("Newly created identity token could not be verified.");

        return {
          success: false,
          message: "Request identity could not be established.",
        };
      }

      cookieStore.set({
        name: IDENTITY_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: IDENTITY_COOKIE_MAX_AGE,
      });
    }

    const { count, error: countError } = await db
      .from("small_talks")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", verifiedIdentity.userId);

    if (countError) {
      console.error("Could not check small talk limit:", countError);

      return {
        success: false,
        message: "Could not verify your posting limit.",
      };
    }

    if ((count ?? 0) >= MAX_POSTS_PER_USER) {
      return {
        success: false,
        message: `You can only publish up to ${MAX_POSTS_PER_USER} posts.`,
      };
    }

    const hash = await docToHash(document);
    const contentHashed = hash.startsWith("#") ? hash : `#${hash}`;

    if (!isValidContentHash(contentHashed)) {
      return {
        success: false,
        message: "Invalid document payload.",
      };
    }

    const smallTalk = await createSmallTalk({
      contentHashed,
      title: normalizedTitle,
      userId: verifiedIdentity.userId,
    });

    revalidatePath("/");

    return {
      success: true,
      id: smallTalk.id,
    };
  } catch (error) {
    console.error("Could not create small talk:", error);

    return {
      success: false,
      message: "Content could not be saved.",
    };
  }
}

async function readBytes(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<Uint8Array<ArrayBuffer>> {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      if (value !== undefined) {
        chunks.push(value);
        totalLength += value.length;
      }
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export async function docToHash(doc: SerializedDocument): Promise<string> {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();

  try {
    const [, compressed] = await Promise.all([
      writer
        .write(new TextEncoder().encode(JSON.stringify(doc)))
        .then(() => writer.close()),
      readBytes(cs.readable.getReader()),
    ]);

    return `#doc=${toBase64Url(compressed)}`;
  } finally {
    writer.releaseLock();
  }
}

export async function docFromHash(
  hash: string,
): Promise<SerializedDocument | null> {
  const match = /^#doc=([A-Za-z0-9_-]+)$/.exec(hash);
  const encoded = match?.[1];

  if (!encoded) return null;

  try {
    const compressed = fromBase64Url(encoded);
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();

    try {
      const [, decompressed] = await Promise.all([
        writer.write(compressed).then(() => writer.close()),
        readBytes(ds.readable.getReader()),
      ]);

      return JSON.parse(
        new TextDecoder().decode(decompressed),
      ) as SerializedDocument;
    } finally {
      writer.releaseLock();
    }
  } catch {
    return null;
  }
}
