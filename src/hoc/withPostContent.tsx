import type { EditorProps } from "@/features/editor";
import { db } from "@/lib/db/server";
import type { Blog } from "@/types/db.types";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

type InjectedPostContentProps = Pick<EditorProps, "initialMarkdown">;

export type WithPostContentProps = Omit<
  EditorProps,
  keyof InjectedPostContentProps
> & {
  id?: Blog["id"];
  draft?: boolean;
};

export function withPostContent(Component: ComponentType<EditorProps>) {
  return async ({ id, draft, ...props }: WithPostContentProps) => {
    if (typeof id === "undefined") {
      return <Component {...props} />;
    }

    const { data, error } = await db
      .from(draft ? "drafts" : "blog_posts")
      .select("content")
      .eq("id", id)
      .single();

    if (error) {
      return notFound();
    }

    return <Component {...props} initialMarkdown={data?.content ?? null} />;
  };
}
