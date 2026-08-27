"use client";

import { PostCard } from "@/features/blog-posts/post-card";
import type { Blog } from "@/types/db.types";
import { PostCardModal } from "./modal";

interface PostsModalProps {
  posts: Blog[];
}

export function PostsModal({ posts }: PostsModalProps) {
  return (
    <PostCardModal
      className="m-16 rounded-2xl border-none bg-black px-1 focus:outline-1 focus-visible:ring-0"
      title="Edit Posts"
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
