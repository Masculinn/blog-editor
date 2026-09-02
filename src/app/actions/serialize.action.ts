"use server";

import { serializeMDX, type MDXRecord } from "@/lib/mdx/serializeMDX";

export default async function serializeMDXAction(
  source: string,
  scope: MDXRecord,
) {
  return serializeMDX(source, scope);
}
