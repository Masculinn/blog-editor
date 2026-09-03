import { db } from "@/lib/db/server";
import type { Blog } from "@/types/db.types";
import type { ComponentType } from "react";

type WithPostProps = Pick<Blog, "id"> & { isDraft?: boolean };
type InjectedBlogProps<T> = Omit<T, keyof Blog>;
type WrappedProps<T> = InjectedBlogProps<T> & WithPostProps;

export function withPost<T extends object>(Component: ComponentType<T>) {
  return async ({ id, isDraft, ...props }: WrappedProps<T>) => {
    const { data: post, error } = await db
      .from(isDraft ? "drafts" : "blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !post) {
      console.error(`Post with id ${id} not found:`, error?.message);

      return null;
    }

    return (
      <Component
        {...({
          ...props,
          ...post,
        } as T)}
      />
    );
  };
}
