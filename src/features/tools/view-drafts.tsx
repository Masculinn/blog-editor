"use client";

import viewDraftsAction, {
  type DraftWithoutContent,
} from "@/app/actions/drafts.action";
import { PostCard } from "@/components/blog/post-card";
import { Modal } from "@/components/modal";
import { PostLoader } from "@/components/skeleton/post-card-skeleton";
import { useState } from "react";
import { toast } from "sonner";
import type { ToolComponentProps } from "../../types/tools.types";

export function ViewDrafts({ render, title }: ToolComponentProps) {
  const [drafts, setDrafts] = useState<DraftWithoutContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadDrafts() {
    setIsLoading(true);

    try {
      const data = await viewDraftsAction();
      setDrafts(data);
    } catch {
      toast.error("Failed to fetch drafts.");
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
