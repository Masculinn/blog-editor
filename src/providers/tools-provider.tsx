"use client";

import { CommandDialog } from "@/components/ui/command";
import type { ToolsContext as ToolsContextType } from "@/features/tools/types";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { createContext, useContext, useState } from "react";

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

const useTools = () => {
  const context = useContext(ToolsContext);

  if (context === undefined) {
    throw new Error("useTools must be used within a ToolsProvider");
  }

  return context;
};

function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useKeyboardShortcut(
    ["Control", "k"],
    () => {
      setOpen((curr) => !curr);
    },
    {
      allowInEditable: true,
      preventDefault: true,
      stopPropagation: true,
    },
  );

  return (
    <ToolsContext
      value={{
        open,
        setOpen,
      }}
    >
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        modal
        keepMounted
        finalFocus={false}
      >
        {children}
      </CommandDialog>
    </ToolsContext>
  );
}

export { ToolsProvider as default, useTools };
