"use client";

import viewDraftsAction from "@/app/actions/view/drafts.action";
import { PostCard } from "@/components/blog/post-card";
import { Modal } from "@/components/modal";
import { PostLoader } from "@/components/skeleton/post-card-skeleton";
import { Button } from "@/components/ui/button";
import type { Draft } from "@/types/db.types";
import { GlobeIcon, TrashIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ToolComponentProps } from "../../types/tools.types";

export function PublishDraft({ render, title }: ToolComponentProps) {
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
            <div
              key={post.id}
              className="w-fit max-w-100 relative first:pl-2 rounded-2xl overflow-hidden group"
            >
              <div className="absolute size-full z-50 inset-0 bg-linear-to-b from-transparent to-black flex items-end justify-center mx-2 p-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <Button variant="destructive" size="lg" className="w-full">
                    <TrashIcon className="size-4" />
                    Delete
                  </Button>
                  <Button variant="primary" size="lg" className="w-full">
                    <GlobeIcon className="size-4" />
                    Publish
                  </Button>
                </div>
              </div>
              <PostCard
                draft
                className="size-full -z-10"
                close={close}
                static
                {...post}
              />
            </div>
          ))
        )
      }
    </Modal>
  );
}
