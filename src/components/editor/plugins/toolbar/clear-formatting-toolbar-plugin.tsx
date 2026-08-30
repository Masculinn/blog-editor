import { useToolbarContext } from "@/components/toolbar-context";
import { Button } from "@/components/ui/button";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import { $isTableSelection } from "@lexical/table";
import { $getNearestBlockElementAncestorOrThrow } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
} from "lexical";
import { EraserIcon } from "lucide-react";
import { useCallback, useEffect } from "react";

export function ClearFormattingToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection) && !$isTableSelection(selection)) {
        return;
      }

      const anchor = selection.anchor;
      const focus = selection.focus;
      const nodes = selection.getNodes();
      const extractedNodes = selection.extract();

      if (anchor.key === focus.key && anchor.offset === focus.offset) {
        return;
      }

      nodes.forEach((node, idx) => {
        if ($isTextNode(node)) {
          let textNode = node;

          if (idx === 0 && anchor.offset !== 0) {
            textNode = textNode.splitText(anchor.offset)[1] || textNode;
          }

          if (idx === nodes.length - 1) {
            textNode = textNode.splitText(focus.offset)[0] || textNode;
          }

          const extractedTextNode = extractedNodes[0];

          if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
            textNode = extractedTextNode;
          }

          if (textNode.__style !== "") {
            textNode.setStyle("");
          }

          if (textNode.__format !== 0) {
            textNode.setFormat(0);
            $getNearestBlockElementAncestorOrThrow(textNode).setFormat("");
          }
        } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
          node.replace($createParagraphNode(), true);
        } else if ($isDecoratorBlockNode(node)) {
          node.setFormat("");
        }
      });
    });
  }, [activeEditor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        const isModifier = event.metaKey || event.ctrlKey;
        const isClearFormattingShortcut =
          isModifier &&
          !event.altKey &&
          !event.shiftKey &&
          event.code === "Backslash";

        if (!isClearFormattingShortcut) {
          return false;
        }

        event.preventDefault();
        clearFormatting();

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [activeEditor, clearFormatting]);

  return (
    <Button
      aria-label="Clear formatting (⌘/Ctrl + \\)"
      variant="ghost"
      size="icon-sm"
      onClick={clearFormatting}
    >
      <EraserIcon className="size-4" />
    </Button>
  );
}
