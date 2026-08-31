"use client";

import { MDXComponents } from "@/components/mdx/mdx-components";
import type { SerializedMDXSource } from "@/hoc/withMDX";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/db.types";
import { MDXClient } from "next-mdx-remote-client";

type Props = {
  className?: string;
} & Blog &
  SerializedMDXSource;

export function ArticleContent({ className, ...props }: Props) {
  if ("error" in props) {
    return <pre>{JSON.stringify(props.error, null, 2)}</pre>;
  }

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
