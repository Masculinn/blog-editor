"use server";

import { cookies, headers } from "next/headers";

import {
  getRequestIdentity,
  IDENTITY_COOKIE_NAME,
  verifyIdentityToken,
} from "@/lib/auth/request-identity";

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

function isValidContentHash(value: string): boolean {
  return value.startsWith("#doc=") && value.length <= MAX_CONTENT_HASH_LENGTH;
}

export async function createSmallTalkAction(
  contentHashed: string,
): Promise<CreateSmallTalkResult> {
  if (!isValidContentHash(contentHashed)) {
    return {
      success: false,
      message: "Invalid document payload.",
    };
  }

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
      userId: verifiedIdentity.userId,
    });

    return {
      success: true,
      id: smallTalk.id,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Content could not be saved.",
    };
  }
}
