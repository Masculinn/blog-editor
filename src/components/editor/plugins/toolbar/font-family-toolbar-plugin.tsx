import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $getSelection, $isRangeSelection, type BaseSelection } from "lexical";
import { ChevronDownIcon, TypeIcon } from "lucide-react";
import { useState } from "react";

import { useToolbarContext } from "@/components/toolbar-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateToolbarHandler } from "@/components/use-update-toolbar";

const DEFAULT_FONT_FAMILY = "Arial";
const FONT_FAMILY_STYLE = "font-family";

const FONT_FAMILY_OPTIONS = [
  "Arial",
  "Verdana",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Trebuchet MS",
];

export function FontFamilyToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

  const [fontFamily, setFontFamily] = useState(DEFAULT_FONT_FAMILY);

  function $updateToolbar(selection: BaseSelection) {
    if (!$isRangeSelection(selection)) {
      return;
    }

    setFontFamily(
      $getSelectionStyleValueForProperty(
        selection,
        FONT_FAMILY_STYLE,
        DEFAULT_FONT_FAMILY,
      ),
    );
  }

  useUpdateToolbarHandler($updateToolbar);

  function handleClick(option: string) {
    activeEditor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      $patchStyleText(selection, {
        [FONT_FAMILY_STYLE]: option,
      });
    });

    setFontFamily(option);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="w-min gap-1 px-2"
            size="sm"
            aria-label="Formatting options for font family"
          />
        }
      >
        <TypeIcon className="size-4" />
        <span style={{ fontFamily }}>{fontFamily}</span>
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="start">
        {FONT_FAMILY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option}
            style={{ fontFamily: option }}
            onClick={() => {
              handleClick(option);
            }}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
