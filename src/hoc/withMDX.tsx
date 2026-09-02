import { type SerializedMDXSource, serializeMDX } from "@/lib/mdx/serializeMDX";
import type { Blog } from "@/types/db.types";
import type { ComponentType } from "react";

type MDXRecord = Record<string, unknown>;

export function withMDX<P extends Blog>(
  Component: ComponentType<P & SerializedMDXSource>,
) {
  return async (props: P) => {
    const { content, ...scopeValues } = props;

    const scope = Object.fromEntries(
      Object.entries(scopeValues).filter(([, value]) => value !== undefined),
    ) as MDXRecord;

    const mdxSource = await serializeMDX(content, scope);

    return <Component {...props} {...mdxSource} />;
  };
}
