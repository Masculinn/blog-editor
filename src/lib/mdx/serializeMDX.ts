import "server-only";

import remarkAttrsBrackets from "@/components/mdx/plugins/remark-attrs-plugin";
import remarkUnwrapImageParagraphs from "@/components/mdx/plugins/remark-unwrap-image-paragraphs-plugin";

import {
  serialize,
  type SerializeResult,
} from "next-mdx-remote-client/serialize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export type MDXRecord = Record<string, unknown>;

export type SerializedMDXSource = SerializeResult<MDXRecord, MDXRecord>;

export async function serializeMDX(
  source: string,
  scope: MDXRecord,
): Promise<SerializedMDXSource> {
  return serialize<MDXRecord, MDXRecord>({
    source,
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
}
