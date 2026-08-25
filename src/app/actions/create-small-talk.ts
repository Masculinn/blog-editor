"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";

import {
  getRequestIdentity,
  IDENTITY_COOKIE_NAME,
  verifyIdentityToken,
} from "@/lib/auth/index";
import { createSmallTalk } from "@/utils/db/create-small-talk";

const MAX_CONTENT_HASH_LENGTH = 65_536;

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
    value.length <= MAX_CONTENT_HASH_LENGTH
  );
}

function isValidTitle(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function createSmallTalkAction(
  contentHashed: string,
  title: string,
): Promise<CreateSmallTalkResult> {
  if (!isValidTitle(title)) {
    return {
      success: false,
      message: "A title is required.",
    };
  }

  if (!isValidContentHash(contentHashed)) {
    return {
      success: false,
      message: "Invalid document payload.",
    };
  }

  /*
   * Normalize before crossing into the persistence layer.
   *
   * "   My document   "
   * becomes:
   * "My document"
   */
  const normalizedTitle = title.trim();

  const requestHeaders = await headers();
  const cookieStore = await cookies();

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

  try {
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
