"use client";

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useSearchParam } from "@/hooks/use-search-param";

export function ToggleViewer() {
  const { getSearchParam, setSearchParam } = useSearchParam();

  const viewer = getSearchParam("viewer") === "true";

  useKeyboardShortcut(
    ["Control", "/"],
    () => setSearchParam("viewer", !viewer),
    {
      allowInEditable: true,
      preventDefault: true,
      stopImmediatePropagation: true,
      stopPropagation: true,
    },
  );

  return null;
}
