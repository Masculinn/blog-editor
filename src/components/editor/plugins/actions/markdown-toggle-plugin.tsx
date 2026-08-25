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

type MarkdownTogglePluginProps = {
  shouldPreserveNewLinesInMarkdown: boolean;
  transformers: Transformer[];
};

function $isMarkdownMode(): boolean {
  const firstChild = $getRoot().getFirstChild();

  return $isCodeNode(firstChild) && firstChild.getLanguage() === "markdown";
}

export function MarkdownTogglePlugin({
  shouldPreserveNewLinesInMarkdown,
  transformers,
}: MarkdownTogglePluginProps) {
  const [editor] = useLexicalComposerContext();

  const [isMarkdownMode, setIsMarkdownMode] = useState(() =>
    editor.getEditorState().read(() => $isMarkdownMode()),
  );

  /*
   * Keep the React switch synchronized with Lexical itself.
   *
   * This matters because the editor can change through more than this
   * switch:
   *
   * - UrlDocumentSyncPlugin
   * - import
   * - undo / redo
   * - clear
   * - external editor state replacement
   */
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

      /*
       * Markdown ON
       *
       * Convert the current rich-text document into Markdown and
       * replace the root with one markdown CodeNode.
       */
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

      /*
       * Markdown OFF
       *
       * Only convert back if the document is actually represented
       * by our markdown CodeNode.
       */
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
            <Label
              htmlFor="markdown-mode"
              className="cursor-pointer text-xs font-normal"
            >
              Markdown
            </Label>

            <Switch
              id="markdown-mode"
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
