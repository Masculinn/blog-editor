"use client";

import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  type Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getRoot, $setSelection } from "lexical";
import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
type MarkdownTogglePluginProps = {
  id: string;
  shouldPreserveNewLinesInMarkdown: boolean;
  transformers: Transformer[];
};
function $isMarkdownMode(): boolean {
  const firstChild = $getRoot().getFirstChild();

  return $isCodeNode(firstChild) && firstChild.getLanguage() === "markdown";
}

export function MarkdownTogglePlugin({
  id,
  shouldPreserveNewLinesInMarkdown,
  transformers,
}: MarkdownTogglePluginProps) {
  const [editor] = useLexicalComposerContext();

  const [isMarkdownMode, setIsMarkdownMode] = useState(() =>
    editor.getEditorState().read(() => $isMarkdownMode()),
  );

  useKeyboardShortcut(
    ["Control", "m"],
    () => handleMarkdownModeChange(!isMarkdownMode),
    {
      allowInEditable: true,
      preventDefault: true,
      stopPropagation: true,
    },
  );

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      const nextIsMarkdownMode = editorState.read(() => $isMarkdownMode());

      setIsMarkdownMode((currentIsMarkdownMode) =>
        currentIsMarkdownMode === nextIsMarkdownMode
          ? currentIsMarkdownMode
          : nextIsMarkdownMode,
      );
    });
  }, [editor]);

  function handleMarkdownModeChange(checked: boolean): void {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();

      if (checked) {
        if (
          $isCodeNode(firstChild) &&
          firstChild.getLanguage() === "markdown"
        ) {
          return;
        }

        const markdown = $convertToMarkdownString(
          transformers,
          undefined,
          shouldPreserveNewLinesInMarkdown,
        );

        $setSelection(null);

        const codeNode = $createCodeNode("markdown");

        codeNode.append($createTextNode(markdown));

        root.clear();
        root.append(codeNode);

        codeNode.selectEnd();

        return;
      }
      if (!$isCodeNode(firstChild) || firstChild.getLanguage() !== "markdown") {
        return;
      }

      const markdown = firstChild.getTextContent();

      $setSelection(null);

      $convertFromMarkdownString(
        markdown,
        transformers,
        undefined,
        shouldPreserveNewLinesInMarkdown,
      );

      $getRoot().selectEnd();
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div className="flex h-8 items-center gap-2 rounded-md px-2">
            <Label htmlFor={id} className="cursor-pointer text-xs font-normal">
              Markdown
            </Label>

            <Switch
              id={id}
              size="sm"
              checked={isMarkdownMode}
              onCheckedChange={handleMarkdownModeChange}
              aria-label="Toggle Markdown mode"
            />
          </div>
        }
      />

      <TooltipContent>
        {isMarkdownMode ? "Switch to rich text" : "Switch to Markdown"}
      </TooltipContent>
    </Tooltip>
  );
}
