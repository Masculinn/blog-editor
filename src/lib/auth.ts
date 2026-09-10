import "server-only";

import type { NextRequest } from "next/server";

export default function auth(request: NextRequest): boolean {
  const cookieValue = request.cookies.get("x-editor-admin")?.value;
  const userAgent = request.headers.get("user-agent");

  if (process.env.NODE_ENV === "production") {
    if (!userAgent || !cookieValue) return false;
    const expectedAgent = userAgent.replace(/\s+/g, "");
    return (
      expectedAgent === process.env.APP_USER_AGENT &&
      cookieValue === process.env.APP_TOKEN
    );
  }

  return true;
}
