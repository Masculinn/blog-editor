"use client";

import { serializeMDXAction } from "@/app/actions/serialize.action";
import type { MDXRecord, SerializedMDXSource } from "@/lib/mdx/serializeMDX";
import { useDocumentSnapshot } from "@/store/document.store";
import type { Blog } from "@/types/db.types";
import { useEffect, useRef, useState } from "react";

import { MDXComponents } from "@/components/mdx/mdx-components";
import { isSerializedMDXWithError } from "@/lib/mdx/isSerializedMDXWithError";
import { cn } from "@/lib/utils";
import { MDXClient } from "next-mdx-remote-client";
import { toast } from "sonner";
import { ArticleErrorModal } from "./article-error-modal";

type Props = Blog &
  SerializedMDXSource & {
    className?: string;
  };

export function ArticleContent(props: Props) {
  const {
    className,
    banner_image,
    description,
    id,
    level,
    published_at,
    tags,
    title,
  } = props;
  const [mdxSource, setMdxSource] = useState<SerializedMDXSource>(() => {
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
  });

  const requestIdRef = useRef<number>(0);
  const snapshot = useDocumentSnapshot();

  useEffect(() => {
    const source = snapshot.source;

    if (!source) return;

    const requestId = ++requestIdRef.current;

    const timeout = window.setTimeout(() => {
      void (async () => {
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
          toast.error("Failed to serialize live MDX", {
            richColors: true,
          });

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
    snapshot.source,
    banner_image,
    description,
    id,
    level,
    published_at,
    tags,
    title,
  ]);

  if (isSerializedMDXWithError(mdxSource))
    return <ArticleErrorModal {...mdxSource.error} />;

  return (
    <article
      className={cn("leading-snug text-blog-muted tracking-tight", className)}
    >
      <MDXClient
        compiledSource={mdxSource.compiledSource}
        frontmatter={mdxSource.frontmatter}
        scope={mdxSource.scope}
        components={MDXComponents}
      />
    </article>
  );
}
