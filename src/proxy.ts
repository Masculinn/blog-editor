import { NextResponse, type NextRequest } from "next/server";

import {
  createIdentityToken,
  getRequestIdentity,
  IDENTITY_COOKIE_NAME,
  isAdminIdentity,
  verifyIdentityToken,
} from "@/lib/auth/index";

export async function proxy(request: NextRequest) {
  const identity = getRequestIdentity(request.headers);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isAdminIdentity(identity)) {
    return NextResponse.redirect(new URL("/", request.url), 307);
  }

  const response = NextResponse.next();
  if (!identity.ip || !identity.userAgent) return response;

  const existingToken = request.cookies.get(IDENTITY_COOKIE_NAME)?.value;

  const existingIdentity = existingToken
    ? await verifyIdentityToken(existingToken, identity)
    : null;

  if (!existingIdentity) {
    const token = await createIdentityToken(identity);

    response.cookies.set({
      name: IDENTITY_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
