import { db } from "@/lib/db/server";
import type { Blog } from "@/types/db.types";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

type BlogWithoutContent = Omit<Blog, "content">;

type WithPostProps = Pick<Blog, "id"> & { draft?: boolean };
type InjectedBlogProps<T> = Omit<T, keyof BlogWithoutContent>;
type WrappedProps<T> = InjectedBlogProps<T> & WithPostProps;

export function withPostMeta<T extends object>(Component: ComponentType<T>) {
  return async ({ id, draft, ...props }: WrappedProps<T>) => {
    const { data: post, error } = await db
      .from(draft ? "drafts" : "blog_posts")
      .select("banner_image,description,id,level,published_at,tags,title")
      .eq("id", id)
      .single();

    if (error || !post) {
      notFound();
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
