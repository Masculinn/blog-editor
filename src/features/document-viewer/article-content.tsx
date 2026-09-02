"use client";

import { CopyCode } from "@/components/mdx/copy-code";
import { MDXComponents } from "@/components/mdx/mdx-components";
import { Scales } from "@/components/scales";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SerializedMDXSource } from "@/lib/mdx/serializeMDX";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/db.types";
import { SearchAlertIcon } from "lucide-react";
import { MDXClient } from "next-mdx-remote-client";

type Props = {
  className?: string;
} & Blog &
  SerializedMDXSource;

export function ArticleContent({ className, ...props }: Props) {
  if ("error" in props) {
    return <ErrorBoundary {...props.error} />;
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
