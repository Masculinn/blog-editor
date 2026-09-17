"use client";

import { CommandDialog } from "@/components/ui/command";
import {
  type KeyboardShortcut,
  useKeyboardShortcut,
} from "@/hooks/use-keyboard-shortcut";
import settings from "@/settings/client";
import type { ToolsContext as ToolsContextType } from "@/types/tools.types";
import { createContext, useContext, useState } from "react";

const shortcut = settings.shortcuts
  .toggleCommandCenter as unknown as KeyboardShortcut;

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
    shortcut,
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
