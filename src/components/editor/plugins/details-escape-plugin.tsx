"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
} from "lexical";
import { useEffect } from "react";

import { $isDetailsContainerNode } from "@/components/editor/nodes/details-container-node";
import { $isDetailsContentNode } from "@/components/editor/nodes/details-content-node";

export function DetailsEscapePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();

        if (
          !event ||
          !$isRangeSelection(selection) ||
          !selection.isCollapsed()
        ) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();

        /*
         * Because DetailsContentNode is a shadow root,
         * getTopLevelElementOrThrow() returns the block directly
         * underneath DetailsContentNode.
         */
        const block = anchorNode.getTopLevelElementOrThrow();
        const content = block.getParent();

        if (!$isDetailsContentNode(content)) {
          return false;
        }

        /*
         * Only escape from the final block in the details body.
         */
        if (!block.is(content.getLastChild())) {
          return false;
        }

        /*
         * Require an empty trailing paragraph.
         *
         * So:
         *
         *   Some content|
         *
         * Enter
         *
         *   Some content
         *   |
         *
         * Enter again => escape details
         */
        if (!$isParagraphNode(block) || block.getTextContentSize() !== 0) {
          return false;
        }

        const details = content.getParent();

        if (!$isDetailsContainerNode(details)) {
          return false;
        }

        event.preventDefault();

        /*
         * Reuse an existing paragraph after <details> if there is one.
         * Otherwise create it.
         */
        const nextSibling = details.getNextSibling();

        if ($isParagraphNode(nextSibling)) {
          nextSibling.selectStart();
          return true;
        }

        const paragraph = $createParagraphNode();

        details.insertAfter(paragraph);
        paragraph.selectStart();

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
