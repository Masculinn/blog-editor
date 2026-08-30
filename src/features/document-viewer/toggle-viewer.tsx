"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  return (
    <div className="flex h-8 items-center gap-2 rounded-md px-2">
      <Label htmlFor="viewer" className="cursor-pointer text-xs font-normal">
        Viewer
      </Label>

      <Switch
        id="viewer"
        size="sm"
        checked={viewer}
        onCheckedChange={(checked) => setSearchParam("viewer", checked)}
      />
    </div>
  );
}
