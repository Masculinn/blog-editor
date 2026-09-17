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
import {
  type KeyboardShortcut,
  useKeyboardShortcut,
} from "@/hooks/use-keyboard-shortcut";
import settings from "@/settings/client";

type MarkdownTogglePluginProps = {
  id: string;
  shouldPreserveNewLinesInMarkdown: boolean;
  transformers: Transformer[];
  withUI?: boolean;
};

const shortcut = settings.shortcuts
  .toggleMarkdown as unknown as KeyboardShortcut;

function $isMarkdownMode(): boolean {
  const firstChild = $getRoot().getFirstChild();

  return $isCodeNode(firstChild) && firstChild.getLanguage() === "markdown";
}

export function MarkdownTogglePlugin({
  id,
  shouldPreserveNewLinesInMarkdown,
  transformers,
  withUI = false,
}: MarkdownTogglePluginProps) {
  const [editor] = useLexicalComposerContext();

  const [isMarkdownMode, setIsMarkdownMode] = useState(() =>
    editor.getEditorState().read(() => $isMarkdownMode()),
  );

  useKeyboardShortcut(
    shortcut,
    () => handleMarkdownModeChange(!isMarkdownMode),
    {
      allowInEditable: true,
      preventDefault: true,
      stopPropagation: true,
      stopImmediatePropagation: true,
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
        if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown")
          return;

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
      if (!$isCodeNode(firstChild) || firstChild.getLanguage() !== "markdown")
        return;

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

  if (!withUI) return null;
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
