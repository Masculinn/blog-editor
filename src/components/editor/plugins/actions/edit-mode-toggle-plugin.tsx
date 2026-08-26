import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

const EDIT_MODE_SHORTCUT = ["Control", "e"] as const;

export function EditModeTogglePlugin() {
  const [editor] = useLexicalComposerContext();

  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  useEffect(() => {
    return editor.registerEditableListener(setIsEditable);
  }, [editor]);

  const toggleEditMode = () => {
    editor.setEditable(!editor.isEditable());
  };

  useKeyboardShortcut(EDIT_MODE_SHORTCUT, toggleEditMode, {
    allowInEditable: true,
    stopPropagation: true,
  });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            onClick={toggleEditMode}
            title="Read-Only Mode"
            aria-label={`${!isEditable ? "Unlock" : "Lock"} read-only mode`}
            size="sm"
            className="p-2"
          />
        }
      >
        {isEditable ? (
          <LockIcon className="size-4" />
        ) : (
          <UnlockIcon className="size-4" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        {isEditable ? (
          <>
            <span>"View Only Mode</span> <Kbd>Control</Kbd>
            <Kbd>e</Kbd>
          </>
        ) : (
          "Edit Mode"
        )}
      </TooltipContent>
    </Tooltip>
  );
}
