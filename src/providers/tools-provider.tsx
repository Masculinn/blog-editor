"use client";

import { CommandDialog } from "@/components/ui/command";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type ToolsContext = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const ToolsContext = createContext<ToolsContext | undefined>(undefined);

const useTools = () => {
  const context = useContext(ToolsContext);

  if (typeof context === "undefined") {
    throw new Error("useTools must be used within a ToolsProvider");
  }

  return context;
};

function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useKeyboardShortcut(["Control", "k"], () => setOpen(!open), {
    allowInEditable: true,
    preventDefault: true,
    stopPropagation: true,
  });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <ToolsContext value={{ open, setOpen }}>{children}</ToolsContext>
    </CommandDialog>
  );
}

export { ToolsProvider as default, useTools };
