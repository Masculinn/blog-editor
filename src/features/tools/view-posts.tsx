"use client";

import viewPostsAction from "@/app/actions/view/posts.action";
import { PostCard } from "@/components/blog/post-card";
import { Modal } from "@/components/modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Blog } from "@/types/db.types";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ToolComponentProps } from "../../types/tools.types";

export function ViewPosts({ render, title }: ToolComponentProps) {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadedRef = useRef(false);
  const loadingRef = useRef(false);

  async function loadPosts() {
    if (loadedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const data = await viewPostsAction();

      setPosts(data);
      loadedRef.current = true;
    } catch {
      toast.error("Failed to fetch posts.");
    } finally {
      loadingRef.current = false;
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
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              className="w-fit max-w-100"
              close={close}
              {...post}
            />
          ))
        )
      }
    </Modal>
  );
}

function PostLoader() {
  return Array.from({
    length: 4,
  }).map((_, index) => (
    <Skeleton
      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
      key={index}
      className="h-100 w-full"
    />
  ));
}
