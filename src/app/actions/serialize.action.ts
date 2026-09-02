"use server";

import {
  serializeMDX,
  type MDXRecord,
  type SerializedMDXSource,
} from "@/lib/mdx/serializeMDX";

export async function serializeMDXAction(
  source: string,
  scope: MDXRecord,
): Promise<SerializedMDXSource> {
  return serializeMDX(source, scope);
}
