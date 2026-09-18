"use client";

import { serializeMDXAction } from "@/app/actions/serialize.action";
import { MDXComponents } from "@/components/mdx/mdx-components";
import { useSearchParam } from "@/hooks/use-search-param";
import { isSerializedMDXWithError } from "@/lib/mdx/isSerializedMDXWithError";
import type { MDXRecord, SerializedMDXSource } from "@/lib/mdx/serializeMDX";
import { useDocumentSnapshot } from "@/store/document.store";
import type { Blog } from "@/types/db.types";
import { MDXClient } from "next-mdx-remote-client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArticleErrorModal } from "./article-error-modal";

type Props = Blog & SerializedMDXSource;

type ArticleContentBodyProps = {
  article: Props;
};

function getInitialMdxSource(props: Props): SerializedMDXSource {
  if (isSerializedMDXWithError(props)) {
    return {
      error: props.error,
      frontmatter: props.frontmatter,
      scope: props.scope,
    };
  }

  return {
    compiledSource: props.compiledSource,
    frontmatter: props.frontmatter,
    scope: props.scope,
  };
}

export function ArticleContent(props: Props) {
  const { getSearchParam } = useSearchParam();

  const isDraft = getSearchParam("draft") === "true";

  return (
    <ArticleContentBody
      key={JSON.stringify([isDraft, props.id, props.content])}
      article={props}
    />
  );
}

function ArticleContentBody({ article }: ArticleContentBodyProps) {
  const {
    banner_image,
    description,
    id,
    level,
    published_at,
    tags,
    title,
    content,
  } = article;

  const requestIdRef = useRef(0);

  const [initialMdxSource] = useState<SerializedMDXSource>(() =>
    getInitialMdxSource(article),
  );

  const [mdxSource, setMdxSource] =
    useState<SerializedMDXSource>(initialMdxSource);

  const snapshot = useDocumentSnapshot();
  const source = snapshot.hash.startsWith("#doc=") ? snapshot.source : null;

  if (source) {
    console.log(JSON.stringify(snapshot.source, null, 2));
  }
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (source === null) return;
    if (source === (content ?? "")) return setMdxSource(initialMdxSource);

    const timeout = window.setTimeout(() => {
      (async () => {
        const scope: MDXRecord = {
          banner_image,
          description,
          id,
          level,
          published_at,
          tags,
          title,
        };

        try {
          const result = await serializeMDXAction(source, scope);

          if (requestId !== requestIdRef.current) return;

          setMdxSource(result);
        } catch (error) {
          if (requestId !== requestIdRef.current) return;

          toast.error("Failed to serialize live MDX");
          console.error("Failed to serialize live MDX:", error);
        }
      })();
    }, 100);

    return () => {
      window.clearTimeout(timeout);

      if (requestIdRef.current === requestId) {
        ++requestIdRef.current;
      }
    };
  }, [
    source,
    content,
    initialMdxSource,
    banner_image,
    description,
    id,
    level,
    published_at,
    tags,
    title,
  ]);

  if (isSerializedMDXWithError(mdxSource)) {
    return <ArticleErrorModal {...mdxSource.error} />;
  }

  return (
    <article className="relative px-8 leading-snug tracking-tight text-blog-muted">
      <MDXClient
        compiledSource={mdxSource.compiledSource}
        frontmatter={mdxSource.frontmatter}
        scope={mdxSource.scope}
        components={MDXComponents}
      />
    </article>
  );
}
