"use client";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import type { ToolComponentProps } from "@/types/tools.types";
import { PlusIcon } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  title: z.string(),
});

export function CreateDraft({ render, title }: ToolComponentProps) {
  return (
    <Modal
      title={title}
      render={render}
      finalFocus={false}
      className="mx-24"
      wrapper={({ children }) => (
        <div className="relative h-max w-full overflow-y-hidden px-4">
          {children}
        </div>
      )}
    >
      {({ close }) => (
        <div className="h-96 w-full">
          <Button variant={"success"} size={"lg"} onClick={close}>
            <PlusIcon />
            Create Draft
          </Button>
        </div>
      )}
    </Modal>
  );
}
