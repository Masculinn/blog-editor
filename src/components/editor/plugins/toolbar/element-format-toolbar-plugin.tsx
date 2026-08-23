import { $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import {
  $isElementNode,
  $isRangeSelection,
  type BaseSelection,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  IndentDecreaseIcon,
  IndentIncreaseIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import { getSelectedNode } from "@/components/get-selected-node";
import { useToolbarContext } from "@/components/toolbar-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUpdateToolbarHandler } from "@/components/use-update-toolbar";

type AlignmentFormat = Exclude<ElementFormatType, "start" | "end" | "">;

const ELEMENT_FORMAT_OPTIONS: Record<
  AlignmentFormat,
  {
    icon: ReactNode;
    name: string;
  }
> = {
  left: {
    icon: <AlignLeftIcon className="size-4" />,
    name: "Left Align",
  },
  center: {
    icon: <AlignCenterIcon className="size-4" />,
    name: "Center Align",
  },
  right: {
    icon: <AlignRightIcon className="size-4" />,
    name: "Right Align",
  },
  justify: {
    icon: <AlignJustifyIcon className="size-4" />,
    name: "Justify Align",
  },
};

const ALIGNMENT_FORMATS = new Set<ElementFormatType>([
  "left",
  "center",
  "right",
  "justify",
]);

function isAlignmentFormat(value: ElementFormatType): value is AlignmentFormat {
  return ALIGNMENT_FORMATS.has(value);
}

export function ElementFormatToolbarPlugin({
  separator = true,
}: {
  separator?: boolean;
}) {
  const { activeEditor } = useToolbarContext();

  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");

  function $updateToolbar(selection: BaseSelection) {
    if (!$isRangeSelection(selection)) {
      return;
    }

    const node = getSelectedNode(selection);
    const parent = node.getParent();

    const matchingParent = $isLinkNode(parent)
      ? $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        )
      : null;

    if ($isElementNode(matchingParent)) {
      setElementFormat(matchingParent.getFormatType());
      return;
    }

    if ($isElementNode(node)) {
      setElementFormat(node.getFormatType());
      return;
    }

    setElementFormat(parent?.getFormatType() || "left");
  }

  useUpdateToolbarHandler($updateToolbar);

  function handleAlignmentValueChange(values: string[]) {
    const value = values.at(-1);

    if (value === undefined || !isAlignmentFormat(value as ElementFormatType)) {
      return;
    }

    const format = value as AlignmentFormat;

    setElementFormat(format);
    activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  }

  function handleOutdent() {
    activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  }

  function handleIndent() {
    activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  }

  const alignmentValue = isAlignmentFormat(elementFormat)
    ? [elementFormat]
    : [];

  return (
    <>
      <ToggleGroup
        value={alignmentValue}
        onValueChange={handleAlignmentValueChange}
      >
        {Object.entries(ELEMENT_FORMAT_OPTIONS).map(([value, option]) => (
          <ToggleGroupItem
            key={value}
            value={value}
            variant="default"
            size="sm"
            aria-label={option.name}
          >
            {option.icon}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {separator && (
        <Separator orientation="vertical" className="my-auto h-6" />
      )}

      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleOutdent}
          aria-label="Outdent"
        >
          <IndentDecreaseIcon className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleIndent}
          aria-label="Indent"
        >
          <IndentIncreaseIcon className="size-4" />
        </Button>
      </div>
    </>
  );
}
