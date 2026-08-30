import { db } from "@/lib/db/server";
import type { Blog } from "@/types/db.types";
import type { ComponentType } from "react";

export type PostsProps = {
  posts: Blog[];
  className?: string;
};

type WithoutPosts<T extends PostsProps> = Omit<T, "posts">;

export function withPosts<T extends PostsProps>(Component: ComponentType<T>) {
  return async (props: WithoutPosts<T>) => {
    const { data: posts, error } = await db
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) return null;

    return (
      <Component
        {...({
          ...props,
          posts,
        } as T)}
      />
    );
  };
}
