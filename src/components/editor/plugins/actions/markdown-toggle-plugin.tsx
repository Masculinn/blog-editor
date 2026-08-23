import { useCallback } from "react";

import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  type Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getRoot, $setSelection } from "lexical";
import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MarkdownTogglePlugin({
  shouldPreserveNewLinesInMarkdown,
  transformers,
}: {
  shouldPreserveNewLinesInMarkdown: boolean;
  transformers: Transformer[];
}) {
  const [editor] = useLexicalComposerContext();

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();

      if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
        const markdown = firstChild.getTextContent();

        $setSelection(null);

        $convertFromMarkdownString(
          markdown,
          transformers,
          undefined,
          shouldPreserveNewLinesInMarkdown,
        );

        $getRoot().selectEnd();

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
    });
  }, [editor, shouldPreserveNewLinesInMarkdown, transformers]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="p-2"
      title="Toggle Markdown"
      aria-label="Toggle Markdown"
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={handleMarkdownToggle}
    >
      <FileTextIcon className="size-4" />
    </Button>
  );
}
