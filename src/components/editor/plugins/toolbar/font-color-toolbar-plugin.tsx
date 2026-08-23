import { useCallback, useState } from "react";

const getThemeForegroundColor = () => {
  if (typeof window === "undefined") return "#000";
  return getComputedStyle(document.documentElement).color || "#000";
};

import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $getSelection, $isRangeSelection, type BaseSelection } from "lexical";

import { BaselineIcon } from "lucide-react";

import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerTrigger,
} from "@/components/color-picker";
import { useToolbarContext } from "@/components/toolbar-context";
import { Button } from "@/components/ui/button";
import { useUpdateToolbarHandler } from "@/components/use-update-toolbar";

export function FontColorToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

  const [fontColor, setFontColor] = useState(getThemeForegroundColor);

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      setFontColor(
        $getSelectionStyleValueForProperty(
          selection,
          "color",
          getThemeForegroundColor(),
        ),
      );
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        activeEditor.setEditable(false);
        if (selection !== null) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText],
  );

  return (
    <ColorPicker
      modal
      defaultFormat="hex"
      defaultValue={fontColor}
      onValueChange={onFontColorSelect}
      onOpenChange={(open) => {
        if (!open) {
          activeEditor.setEditable(true);
          activeEditor.focus();
        }
      }}
    >
      <ColorPickerTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <BaselineIcon className="size-4" />
      </ColorPickerTrigger>
      <ColorPickerContent>
        <ColorPickerArea />
        <div className="flex items-center gap-2">
          <ColorPickerEyeDropper />
          <div className="flex flex-1 flex-col gap-4">
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ColorPickerFormatSelect />
          <ColorPickerInput />
        </div>
      </ColorPickerContent>
    </ColorPicker>
  );
}
