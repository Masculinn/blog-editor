"use client";

import { PostCard } from "@/components/blog/post-card";
import type { Blog } from "@/types/db.types";
import type { JSX } from "react";
import { PostCardModal } from "./modal";

export function PostsModal({
  posts,
  title,
  render,
}: {
  posts: Blog[];
  title: string;
  render: JSX.Element | undefined;
}) {
  return (
    <PostCardModal
      className="mx-16 my-16 rounded-2xl border-none bg-black/50 backdrop-blur-3xl focus:outline-1 focus:outline-muted focus-visible:ring-0"
      title={title}
      render={render}
    >
      {({ close }) =>
        posts.map((post) => (
          <PostCard
            key={post.id}
            clasName="w-fit max-w-100"
            close={close}
            {...post}
          />
        ))
      }
    </PostCardModal>
  );
}
