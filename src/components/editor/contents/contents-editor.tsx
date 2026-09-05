import {
  $addUpdateTag,
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  HISTORY_PUSH_TAG,
  type LexicalEditor,
  type NodeKey,
} from "lexical";

import { $createContentsNode, $isContentsNode } from "./contents-node";
import { contentsDataSchema, type ContentsData } from "./contents-types";

export type ContentsTarget =
  | {
      type: "insert";
      insertionKey: NodeKey | null;
    }
  | {
      type: "update";
      nodeKey: NodeKey;
    };

export function $getContentsInsertionKey(): NodeKey | null {
  const selection = $getSelection();
  const selectedNode = selection?.getNodes()[0];
  const topLevelNode = selectedNode?.getTopLevelElement();

  return topLevelNode?.getKey() ?? $getRoot().getLastChild()?.getKey() ?? null;
}

export function saveContents(
  editor: LexicalEditor,
  target: ContentsTarget,
  data: ContentsData,
): string | null {
  if (!editor.isEditable()) {
    return "The editor is read-only.";
  }

  const validation = contentsDataSchema.safeParse(data);

  if (!validation.success) {
    return validation.error.issues[0].message;
  }

  let error: string | null = null;

  editor.update(
    () => {
      if (target.type === "update") {
        const node = $getNodeByKey(target.nodeKey);

        if (!$isContentsNode(node)) {
          error =
            "This contents block no longer exists. Close the dialog and insert a new one.";

          return;
        }

        $addUpdateTag(HISTORY_PUSH_TAG);
        node.setData(validation.data);

        return;
      }

      const root = $getRoot();

      const anchor =
        target.insertionKey === null
          ? null
          : $getNodeByKey(target.insertionKey);

      if (
        target.insertionKey !== null &&
        (!anchor || anchor.getParent()?.getKey() !== root.getKey())
      ) {
        error =
          "The insertion position changed. Close the dialog and choose a new position.";

        return;
      }

      $addUpdateTag(HISTORY_PUSH_TAG);

      const node = $createContentsNode(validation.data);

      if ($isParagraphNode(anchor) && anchor.isEmpty()) {
        anchor.replace(node);
      } else if (anchor) {
        anchor.insertAfter(node);
      } else {
        root.append(node);
      }

      const next = node.getNextSibling();

      if ($isParagraphNode(next)) {
        next.selectStart();

        return;
      }

      const paragraph = $createParagraphNode();

      node.insertAfter(paragraph);
      paragraph.select();
    },
    { discrete: true },
  );

  return error;
}
