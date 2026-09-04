"use client";

import {
  type BlogWithoutContent,
  viewPostsAction,
} from "@/app/actions/posts.action";
import { PostCard } from "@/components/blog/post-card";
import { Modal } from "@/components/modal";
import { PostLoader } from "@/components/skeleton/post-card-skeleton";
import { ViewEmpty } from "@/components/view-empty";
import { useState } from "react";
import { toast } from "sonner";
import type { ToolComponentProps } from "../../types/tools.types";

export function ViewPosts({ render, title }: ToolComponentProps) {
  const [posts, setPosts] = useState<BlogWithoutContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadPosts() {
    setIsLoading(true);

    try {
      const data = await viewPostsAction();
      setPosts(data);
    } catch {
      toast.error("Failed to fetch posts.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      title={title}
      render={render}
      finalFocus={false}
      onOpenChange={(open) => {
        if (open) {
          void loadPosts();
        }
      }}
      wrapper={({ children }) => (
        <div className="relative h-max w-full overflow-y-hidden px-4">
          <div className="scrollbar-custom flex w-full flex-col gap-2.5 overflow-x-scroll md:flex-row">
            {children}
          </div>
        </div>
      )}
    >
      {({ close }) =>
        isLoading && !posts.length ? (
          <PostLoader />
        ) : posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              className="w-fit max-w-100"
              close={close}
              {...post}
            />
          ))
        ) : (
          <ViewEmpty
            onRefresh={loadPosts}
            title="No posts found"
            desc="You haven't publish any post yet. Create a draft and publish, it will appear here."
          />
        )
      }
    </Modal>
  );
}
