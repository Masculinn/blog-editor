"use client";

import {
  type KeyboardShortcut,
  useKeyboardShortcut,
} from "@/hooks/use-keyboard-shortcut";
import { useSearchParam } from "@/hooks/use-search-param";
import settings from "@/settings/client";
import { toast } from "sonner";

const shortcut = settings.shortcuts.toggleViewer as unknown as KeyboardShortcut;

export function ToggleViewer() {
  const { getSearchParam, setSearchParam } = useSearchParam();

  const postId = getSearchParam("id");
  const viewer = getSearchParam("viewer") === "true";

  useKeyboardShortcut(
    shortcut,
    () => {
      if (!postId) {
        toast.warning("You cannot toggle the viewer", {
          description:
            "No post/draft selected. Please select a post/draft first from the command center.",
        });

        return;
      }
      setSearchParam("viewer", !viewer);
    },
    {
      allowInEditable: true,
      preventDefault: true,
      stopImmediatePropagation: true,
      stopPropagation: true,
    },
  );

  return null;
}
