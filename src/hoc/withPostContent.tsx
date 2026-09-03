import type { EditorProps } from "@/features/editor";
import { db } from "@/lib/db/server";
import type { Blog } from "@/types/db.types";
import type { ComponentType } from "react";

type InjectedPostContentProps = Pick<EditorProps, "initialMarkdown">;

export type WithPostContentProps = Omit<
  EditorProps,
  keyof InjectedPostContentProps
> & {
  id?: Blog["id"];
  isDraft?: boolean;
};

export function withPostContent(Component: ComponentType<EditorProps>) {
  return async ({ id, isDraft, ...props }: WithPostContentProps) => {
    if (typeof id === "undefined") {
      return <Component {...props} />;
    }

    const { data, error } = await db
      .from(isDraft ? "drafts" : "blog_posts")
      .select("content")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Post with id ${id} not found:`, error.message);
      return null;
    }

    return <Component {...props} initialMarkdown={data?.content ?? null} />;
  };
}
