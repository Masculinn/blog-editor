"use client";

import { serializeMDXAction } from "@/app/actions/serialize.action";
import type { MDXRecord, SerializedMDXSource } from "@/lib/mdx/serializeMDX";
import { useDocumentSnapshot } from "@/store/document.store";
import type { Blog } from "@/types/db.types";
import { useEffect, useRef, useState } from "react";

import { CopyCode } from "@/components/mdx/copy-code";
import { Scales } from "@/components/scales";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSerializedMDXWithError } from "@/lib/mdx/isSerializedMDXWithError";
import { SearchAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { ArticleContent } from "./article-content";

type Props = Blog &
  SerializedMDXSource & {
    className?: string;
  };

export function LiveArticleContent(props: Props) {
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
    return <ErrorBoundary {...mdxSource.error} />;

  return (
    <ArticleContent
      className={className}
      compiledSource={mdxSource.compiledSource}
      frontmatter={mdxSource.frontmatter}
      scope={mdxSource.scope}
    />
  );
}

function ErrorBoundary({ name, message, stack }: Error) {
  return (
    <Card size="sm" className="bg-transparent mx-4 mb-12 relative">
      <Scales
        orientation="diagonal"
        className="absolute inset-0 opacity-50 top-0 size-full left-0 -z-10"
        color="#292524"
      />
      <CardHeader>
        <CardTitle className="flex gap-1.5 items-center text-rose-500 ">
          <SearchAlertIcon />
          <h3 className="text-2xl tracking-tighter">Compile {name}</h3>
        </CardTitle>
        <CardDescription>{message}</CardDescription>
        <CardAction>
          {stack && <CopyCode data={stack} variant="ghost" />}
        </CardAction>
      </CardHeader>
      <CardContent className="max-h-auto scrollbar-custom overflow-x-  scroll-fade text-[10px] pr-2">
        <code>{stack}</code>
      </CardContent>
    </Card>
  );
}
