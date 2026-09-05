"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $addUpdateTag,
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  COMMAND_PRIORITY_EDITOR,
  HISTORY_PUSH_TAG,
  type NodeKey,
} from "lexical";
import { useEffect, useState } from "react";

import { OPEN_CONTENTS_DIALOG_COMMAND } from "./contents-commands";
import { ContentsDialog } from "./contents-dialog";
import { $createContentsNode, $isContentsNode } from "./contents-node";
import { createContentsSection, type ContentsData } from "./contents-types";

type ContentsSession = {
  id: string;
  nodeKey: NodeKey | null;
  insertionKey: NodeKey | null;
  data: ContentsData;
};

export function ContentsDialogPlugin() {
  const [editor] = useLexicalComposerContext();
  const [session, setSession] = useState<ContentsSession | null>(null);

  useEffect(() => {
    return editor.registerCommand(
      OPEN_CONTENTS_DIALOG_COMMAND,
      (nodeKey) => {
        if (!editor.isEditable()) {
          return false;
        }

        if (nodeKey !== null) {
          const node = $getNodeByKey(nodeKey);

          if (!$isContentsNode(node)) {
            return false;
          }

          setSession({
            id: crypto.randomUUID(),
            nodeKey,
            insertionKey: null,
            data: node.getData(),
          });

          return true;
        }

        const selection = $getSelection();
        const selectedNode = selection?.getNodes()[0];
        const topLevelNode = selectedNode?.getTopLevelElement();

        setSession({
          id: crypto.randomUUID(),
          nodeKey: null,
          insertionKey:
            topLevelNode?.getKey() ??
            $getRoot().getLastChild()?.getKey() ??
            null,
          data: {
            sections: [createContentsSection()],
          },
        });

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  if (!session) {
    return null;
  }

  function saveContents(data: ContentsData): string | null {
    if (!session) {
      return "The contents dialog is no longer active.";
    }

    if (!editor.isEditable()) {
      return "The editor is read-only.";
    }

    const activeSession = session;
    let error: string | null = null;

    editor.update(
      () => {
        if (activeSession.nodeKey !== null) {
          const node = $getNodeByKey(activeSession.nodeKey);

          if (!$isContentsNode(node)) {
            error =
              "This contents block no longer exists. Close the dialog and insert a new one.";

            return;
          }

          $addUpdateTag(HISTORY_PUSH_TAG);
          node.setData(data);

          return;
        }

        const anchor =
          activeSession.insertionKey !== null
            ? $getNodeByKey(activeSession.insertionKey)
            : null;

        if (
          activeSession.insertionKey !== null &&
          (!anchor || anchor.getParent() !== $getRoot())
        ) {
          error =
            "The insertion position changed. Close the dialog and choose a new position.";

          return;
        }

        $addUpdateTag(HISTORY_PUSH_TAG);

        const node = $createContentsNode(data);

        if ($isParagraphNode(anchor) && anchor.isEmpty()) {
          anchor.replace(node);
        } else if (anchor) {
          anchor.insertAfter(node);
        } else {
          $getRoot().append(node);
        }

        const next = node.getNextSibling();

        if ($isParagraphNode(next)) {
          next.selectStart();
        } else {
          const paragraph = $createParagraphNode();

          node.insertAfter(paragraph);
          paragraph.select();
        }
      },
      { discrete: true },
    );

    if (error) {
      return error;
    }

    setSession(null);

    return null;
  }

  return (
    <ContentsDialog
      key={session.id}
      initialData={session.data}
      isEditing={session.nodeKey !== null}
      onClose={() => setSession(null)}
      onSave={saveContents}
    />
  );
}
