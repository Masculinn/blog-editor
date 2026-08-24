"use client";

import {
  editorStateFromSerializedDocument,
  type SerializedDocument,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { DatabaseIcon, SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createSmallTalkAction } from "@/app/actions/create-small-talk";
import { docFromHash, docToHash } from "@/components/doc-serialization";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ShareContentPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isSaving, setIsSaving] = useState(false);

  function getSerializedDocument(): SerializedDocument {
    return serializedDocumentFromEditorState(editor.getEditorState(), {
      source: "editor",
    });
  }

  async function getDocumentHash(doc: SerializedDocument): Promise<string> {
    const hash = await docToHash(doc);

    return hash.startsWith("#") ? hash : `#${hash}`;
  }

  async function shareDoc(doc: SerializedDocument): Promise<void> {
    const url = new URL(window.location.toString());

    url.hash = await getDocumentHash(doc);

    const newUrl = url.toString();

    window.history.replaceState({}, "", newUrl);

    await window.navigator.clipboard.writeText(newUrl);
  }

  async function saveDoc(): Promise<void> {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const doc = getSerializedDocument();
      const contentHashed = await getDocumentHash(doc);

      const result = await createSmallTalkAction(contentHashed);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Content saved");
    } catch {
      toast.error("Content could not be saved");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    docFromHash(window.location.hash).then((doc) => {
      if (doc && doc.source === "editor") {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));

        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              onClick={() =>
                shareDoc(getSerializedDocument()).then(
                  () => toast.success("URL copied to clipboard"),
                  () => toast.error("URL could not be copied to clipboard"),
                )
              }
              title="Share"
              aria-label="Share current editor content"
              size="sm"
              className="p-2"
            />
          }
        >
          <SendIcon className="size-4" />
        </TooltipTrigger>

        <TooltipContent>Share Content</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              onClick={saveDoc}
              disabled={isSaving}
              title="Save"
              aria-label="Save current editor content"
              size="sm"
              className="p-2"
            />
          }
        >
          <DatabaseIcon className="size-4" />
        </TooltipTrigger>

        <TooltipContent>
          {isSaving ? "Saving..." : "Save Content"}
        </TooltipContent>
      </Tooltip>
    </>
  );
}
