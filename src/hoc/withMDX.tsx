import remarkAttrsBrackets from "@/components/mdx/plugins/remark-attrs-plugin";
import remarkUnwrapImageParagraphs from "@/components/mdx/plugins/remark-unwrap-image-paragraphs-plugin";
import type { Blog } from "@/types/db.types";
import {
  serialize,
  type SerializeResult,
} from "next-mdx-remote-client/serialize";
import type { ComponentType } from "react";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

type MDXRecord = Record<string, unknown>;

export type SerializedMDXSource = SerializeResult<MDXRecord, MDXRecord>;

export function withMDX<P extends Blog>(
  Component: ComponentType<P & SerializedMDXSource>,
) {
  return async function WithMDX(props: P) {
    const { content, ...scopeValues } = props;

    const scope = Object.fromEntries(
      Object.entries(scopeValues).filter(([, value]) => value !== undefined),
    ) as MDXRecord;

    const mdxSource = await serialize<MDXRecord, MDXRecord>({
      source: content,
      options: {
        scope,
        mdxOptions: {
          remarkPlugins: [
            remarkAttrsBrackets,
            remarkUnwrapImageParagraphs,
            remarkGfm,
          ],
          rehypePlugins: [rehypeSlug],
        },
      },
    });

    return <Component {...props} {...mdxSource} />;
  };
}
