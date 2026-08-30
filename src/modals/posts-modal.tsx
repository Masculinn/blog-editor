"use client";

import { Button } from "@/components/ui/button";
import { PostCard } from "@/features/blog-posts/post-card";
import type { Blog } from "@/types/db.types";
import { EyeIcon } from "lucide-react";
import { PostCardModal } from "./modal";

export function PostsModal({
  posts,
  className,
}: {
  posts: Blog[];
  className?: string;
}) {
  return (
    <PostCardModal
      className="my-16 mx-24 rounded-2xl border-none bg-black px-1 focus:outline-1 focus:outline-muted focus-visible:ring-0"
      title="Edit Posts"
      render={
        <Button variant="primary" size="sm" className={className}>
          <EyeIcon />
          View Posts
        </Button>
      }
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
