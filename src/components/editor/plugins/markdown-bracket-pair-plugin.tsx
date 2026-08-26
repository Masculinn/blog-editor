"use client";

import { $isCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $findMatchingParent,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  CONTROLLED_TEXT_INSERTION_COMMAND,
} from "lexical";
import { useEffect } from "react";

function $canPairSquareBrackets(): boolean {
  const selection = $getSelection();

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return false;
  }

  const anchorNode = selection.anchor.getNode();

  const codeNode = $isCodeNode(anchorNode)
    ? anchorNode
    : $findMatchingParent(anchorNode, $isCodeNode);

  // Normal rich-text content.
  if (codeNode === null) {
    return true;
  }

  // Also allow pairing in the CodeNode used by Markdown mode,
  // but not in ordinary JS/TS/etc. code blocks.
  return codeNode.getLanguage() === "markdown";
}

export function MarkdownBracketPairPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (payload) => {
        const insertedText =
          typeof payload === "string" ? payload : payload.data;

        if (insertedText !== "[" && insertedText !== "]") {
          return false;
        }

        const selection = $getSelection();

        if (
          !$isRangeSelection(selection) ||
          !selection.isCollapsed() ||
          !$canPairSquareBrackets()
        ) {
          return false;
        }

        /*
         * OPENING [
         *
         * Critical strategy:
         *
         * 1. Insert "[" normally.
         * 2. Lexical naturally leaves the caret after "[".
         * 3. Insert "]" at that position WITHOUT moving the caret.
         *
         * Result:
         *
         * [|]
         *
         * There is no backward selection movement at all.
         */
        if (insertedText === "[") {
          if (typeof payload !== "string") {
            payload.preventDefault();
          }

          // Normal Lexical insertion.
          selection.insertText("[");

          const nextSelection = $getSelection();

          if (
            !$isRangeSelection(nextSelection) ||
            !nextSelection.isCollapsed() ||
            nextSelection.anchor.type !== "text"
          ) {
            return true;
          }

          const textNode = nextSelection.anchor.getNode();

          if (!$isTextNode(textNode)) {
            return true;
          }

          const caretOffset = nextSelection.anchor.offset;

          /*
           * Add the closing bracket AFTER the caret.
           *
           * moveSelection=false is the important piece.
           *
           * Before:
           *
           * [|
           *
           * After splice:
           *
           * [|]
           *
           * The selection itself never moves.
           */
          textNode.spliceText(caretOffset, 0, "]", false);

          return true;
        }

        /*
         * CLOSING ]
         *
         * If we're already here:
         *
         * [abc|]
         *
         * don't create:
         *
         * [abc]]
         *
         * Just move across our existing auto-paired bracket.
         */
        const anchor = selection.anchor;

        if (anchor.type !== "text") {
          return false;
        }

        const textNode = anchor.getNode();

        if (!$isTextNode(textNode)) {
          return false;
        }

        const offset = anchor.offset;
        const nextCharacter = textNode.getTextContent().charAt(offset);

        if (nextCharacter !== "]") {
          return false;
        }

        if (typeof payload !== "string") {
          payload.preventDefault();
        }

        textNode.select(offset + 1, offset + 1);

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
