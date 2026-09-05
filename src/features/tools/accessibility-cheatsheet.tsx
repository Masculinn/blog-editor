"use client";

import { Modal } from "@/components/modal";
import type { ToolComponentProps } from "@/types/tools.types";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-4 pb-8 sm:px-6 lg:px-10 lg:pb-16">
      <div className="overflow-hidden rounded-2xl border bg-accent/20 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function AccessibilityCheatSheet({ render, title }: ToolComponentProps) {
  return (
    <Modal title={title} render={render} finalFocus={false} wrapper={Wrapper}>
      {({ close }) => <></>}
    </Modal>
  );
}
