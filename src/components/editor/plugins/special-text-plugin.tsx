import type { JSX } from "react";
import { useEffect } from "react";

import { $isCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import { TextNode } from "lexical";

import {
  $createSpecialTextNode,
  SpecialTextNode,
} from "@/components/editor/nodes/special-text-node";

/*
 * Special text now uses:
 *
 * [[special text]]
 *
 * This intentionally does NOT match:
 *
 * [link label](url)
 * ![image alt](url)
 */
const SPECIAL_TEXT_REGEX = /\[\[([^[\]]+)\]\]/;

function $findAndTransformText(node: TextNode): null | TextNode {
  /*
   * Never transform Markdown/code content.
   */
  const parent = node.getParent();

  if ($isCodeNode(parent)) {
    return null;
  }

  const text = node.getTextContent();
  const match = SPECIAL_TEXT_REGEX.exec(text);

  if (!match) {
    return null;
  }

  const matchedText = match[1];
  const startIndex = match.index;
  const endIndex = startIndex + match[0].length;

  let targetNode: TextNode;

  if (startIndex === 0) {
    [targetNode] = node.splitText(endIndex);
  } else {
    [, targetNode] = node.splitText(startIndex, endIndex);
  }

  const specialTextNode = $createSpecialTextNode(matchedText);

  targetNode.replace(specialTextNode);

  return specialTextNode;
}

function $textNodeTransform(node: TextNode): void {
  let targetNode: TextNode | null = node;

  while (targetNode !== null) {
    if (!targetNode.isSimpleText()) {
      return;
    }

    targetNode = $findAndTransformText(targetNode);
  }
}

function useTextTransformation(editor: LexicalEditor): void {
  useEffect(() => {
    if (!editor.hasNodes([SpecialTextNode])) {
      throw new Error(
        "SpecialTextPlugin: SpecialTextNode not registered on editor",
      );
    }

    return editor.registerNodeTransform(TextNode, $textNodeTransform);
  }, [editor]);
}

export function SpecialTextPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useTextTransformation(editor);

  return null;
}
