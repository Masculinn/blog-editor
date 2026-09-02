"use client";

import { MDXComponents } from "@/components/mdx/mdx-components";
import type { SerializedMDXSource } from "@/lib/mdx/serializeMDX";
import { cn } from "@/lib/utils";
import { MDXClient } from "next-mdx-remote-client";

type SerializedMDXSuccess = Extract<
  SerializedMDXSource,
  { compiledSource: string }
>;

type Props = SerializedMDXSuccess & {
  className?: string;
};

export function ArticleContent({
  className,
  ...props
}: Props & SerializedMDXSource) {
  return (
    <article
      className={cn("leading-snug text-blog-muted tracking-tight", className)}
    >
      <MDXClient
        compiledSource={props.compiledSource}
        frontmatter={props.frontmatter}
        scope={props.scope}
        components={MDXComponents}
      />
    </article>
  );
}
