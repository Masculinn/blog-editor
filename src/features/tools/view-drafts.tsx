"use client";

import viewDraftsAction from "@/app/actions/drafts.action";
import { PostCard } from "@/components/blog/post-card";
import { Modal } from "@/components/modal";
import { PostLoader } from "@/components/skeleton/post-card-skeleton";
import type { Draft } from "@/types/db.types";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ToolComponentProps } from "../../types/tools.types";

export function ViewDrafts({ render, title }: ToolComponentProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadedRef = useRef(false);
  const loadingRef = useRef(false);

  async function loadDrafts() {
    if (loadedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const data = await viewDraftsAction();

      setDrafts(data);
      loadedRef.current = true;
    } catch {
      toast.error("Failed to fetch drafts.");
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
          void loadDrafts();
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
        isLoading && !drafts.length ? (
          <PostLoader />
        ) : (
          drafts.map((post) => (
            <PostCard
              key={post.id}
              draft
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
