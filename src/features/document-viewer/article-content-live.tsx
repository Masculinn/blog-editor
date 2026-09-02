"use client";

import serializeMDXAction from "@/app/actions/serialize.action";
import type { MDXRecord, SerializedMDXSource } from "@/lib/mdx/serializeMDX";
import { useDocumentSnapshot } from "@/store/document.store";
import type { Blog } from "@/types/db.types";
import { useEffect, useRef, useState } from "react";

import { ArticleContent } from "./article-content";

type Props = Blog &
  SerializedMDXSource & {
    className?: string;
  };

export function LiveArticleContent(props: Props) {
  const {
    className,
    banner_image,
    content,
    description,
    id,
    level,
    published_at,
    tags,
    title,
  } = props;

  const snapshot = useDocumentSnapshot();

  const requestIdRef = useRef(0);

  const [mdxSource, setMdxSource] = useState<SerializedMDXSource>(() => {
    if ("error" in props) {
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
  });

  useEffect(() => {
    const source = snapshot.source;

    if (!source) {
      return;
    }

    /*
     * Every execution represents a newer compilation request.
     *
     * This prevents a slow, older MDX compilation from replacing
     * a newer one.
     */
    const requestId = ++requestIdRef.current;

    const timeout = window.setTimeout(() => {
      void (async () => {
        /*
         * This mirrors withMDX:
         *
         *   const { content, ...scopeValues } = post
         *
         * We construct it explicitly instead of deriving it from
         * the entire props object.
         */
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

          if (requestId !== requestIdRef.current) {
            return;
          }

          setMdxSource(result);
        } catch (error) {
          /*
           * serialize() normally represents MDX compilation errors
           * inside SerializedMDXSource itself.
           *
           * This catch is primarily for an actual Server Action /
           * network/runtime failure.
           */
          if (requestId !== requestIdRef.current) {
            return;
          }

          console.error("Failed to serialize live MDX:", error);
        }
      })();
    }, 100);

    return () => {
      window.clearTimeout(timeout);

      /*
       * Also invalidate an already-running async request.
       *
       * clearTimeout() only helps if the callback hasn't started yet.
       */
      if (requestIdRef.current === requestId) {
        ++requestIdRef.current;
      }
    };
  }, [
    snapshot.source,
    banner_image,
    description,
    id,
    level,
    published_at,
    tags,
    title,
  ]);

  const blog: Blog = {
    banner_image,
    content,
    description,
    id,
    level,
    published_at,
    tags,
    title,
  };

  /*
   * Narrow the union again before rendering.
   *
   * Don't do:
   *
   *   <ArticleContent {...props} {...mdxSource} />
   *
   * because props can contain the previous union branch. For
   * example, an old compiledSource could survive while mdxSource
   * currently contains an error.
   */
  if ("error" in mdxSource) {
    return (
      <ArticleContent
        {...blog}
        className={className}
        error={mdxSource.error}
        frontmatter={mdxSource.frontmatter}
        scope={mdxSource.scope}
      />
    );
  }

  return (
    <ArticleContent
      {...blog}
      className={className}
      compiledSource={mdxSource.compiledSource}
      frontmatter={mdxSource.frontmatter}
      scope={mdxSource.scope}
    />
  );
}
