"use server";

import {
  getRequestIdentity,
  IDENTITY_COOKIE_NAME,
  verifyIdentityToken,
} from "@/lib/auth";
import { db } from "@/lib/db/server";
import { docToHash } from "@/lib/serialization";
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

    const identityToken = cookieStore.get(IDENTITY_COOKIE_NAME)?.value;

    if (!identityToken) {
      return {
        success: false,
        message: "Identity cookie is missing.",
      };
    }

    const verifiedIdentity = await verifyIdentityToken(identityToken, identity);

    if (!verifiedIdentity) {
      return {
        success: false,
        message: "Request identity could not be verified.",
      };
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
