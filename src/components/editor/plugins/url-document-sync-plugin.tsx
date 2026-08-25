"use client";

import { editorStateFromSerializedDocument } from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_EDITOR_COMMAND, CLEAR_HISTORY_COMMAND } from "lexical";
import { useEffect, useRef } from "react";

import { docFromHash } from "@/components/doc-serialization";

type UrlDocumentSyncPluginProps = {
  documentHash?: string | null;
};

export function UrlDocumentSyncPlugin({
  documentHash,
}: UrlDocumentSyncPluginProps) {
  const [editor] = useLexicalComposerContext();

  const appliedHashRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let disposed = false;

    const requestId = ++requestIdRef.current;

    async function syncDocument() {
      if (!documentHash) {
        if (appliedHashRef.current === null) return;

        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);

        appliedHashRef.current = null;

        return;
      }

      if (documentHash === appliedHashRef.current) return;

      try {
        const doc = await docFromHash(documentHash);

        if (disposed || requestId !== requestIdRef.current) return;
        if (!doc || doc.source !== "editor") return;

        const nextEditorState = editorStateFromSerializedDocument(editor, doc);
        editor.setEditorState(nextEditorState);
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);

        appliedHashRef.current = documentHash;
      } catch (error) {
        if (disposed || requestId !== requestIdRef.current) {
          return;
        }

        console.error("Failed to synchronize editor document:", error);
      }
    }

    void syncDocument();

    return () => {
      disposed = true;
    };
  }, [documentHash, editor]);

  return null;
}
