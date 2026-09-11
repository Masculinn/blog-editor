import auth from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    if (!auth(request))
      return NextResponse.redirect(new URL("/forbidden", request.url));

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
