import { Button } from "@/components/ui/button";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  type Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getRoot } from "lexical";
import { FileTextIcon } from "lucide-react";

export function MarkdownTogglePlugin({
  shouldPreserveNewLinesInMarkdown,
  transformers,
}: {
  shouldPreserveNewLinesInMarkdown: boolean;
  transformers: Array<Transformer>;
}) {
  const [editor] = useLexicalComposerContext();

  useKeyboardShortcut(["Control", "M"], handleMarkdownToggle, {
    allowInEditable: true,
    stopPropagation: true,
  });

  function handleMarkdownToggle() {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();

      if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          transformers,
          undefined,
          shouldPreserveNewLinesInMarkdown,
        );
      } else {
        const markdown = $convertToMarkdownString(
          transformers,
          undefined, // node
          shouldPreserveNewLinesInMarkdown,
        );

        const codeNode = $createCodeNode("markdown");
        codeNode.append($createTextNode(markdown));

        root.clear().append(codeNode);

        if (markdown.length === 0) {
          codeNode.select();
        }
      }
    });
  }

  return (
    <Button
      variant="ghost"
      onClick={handleMarkdownToggle}
      title="Convert From Markdown"
      aria-label="Convert from markdown"
      size="sm"
      className="p-2"
    >
      <FileTextIcon className="size-4" />
    </Button>
  );
}
