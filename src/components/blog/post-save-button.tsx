"use client";

import { updateDraftContent } from "@/app/actions/drafts.action";
import { updatePostContent } from "@/app/actions/posts.action";
import { useHash } from "@/hooks/use-hash";
import {
  useKeyboardShortcut,
  type KeyboardShortcut,
} from "@/hooks/use-keyboard-shortcut";
import { useSearchParam } from "@/hooks/use-search-param";
import { cn } from "@/lib/utils";
import settings from "@/settings/client";
import { useDocumentSnapshot } from "@/store/document.store";
import { useSyncStore } from "@/store/sync.store";
import { LoaderCircleIcon, SaveIcon, ShieldAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type Props = {
  className?: string;
  contentId: number;
};

const shortcut = settings.shortcuts.saveContent as unknown as KeyboardShortcut;

export function PostSaveButton({ className, contentId }: Props) {
  const savingRef = useRef<boolean>(false);
  const savedHashRef = useRef<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentHash, setCurrentHash] = useState<string>("");

  const documentHash = useHash();

  const { getSearchParam } = useSearchParam();
  const isDraft = getSearchParam("draft") === "true";

  const status = useSyncStore((state) => state.syncStatus);

  const { hash: snapshotHash, source: snapshotSource } = useDocumentSnapshot();

  const source = currentHash.startsWith("#doc=") ? snapshotSource : null;

  const isSyncPending = status === "loading" || status === "syncing";
  const isBusy = isSaving || isSyncPending;
  const disabled =
    status !== "synced" ||
    isSaving ||
    savedHashRef.current === currentHash ||
    documentHash === "";

  const label = isSaving
    ? "Saving…"
    : status === "loading"
      ? "Loading…"
      : status === "syncing"
        ? "Syncing…"
        : status === "error"
          ? "Sync failed"
          : "Save Changes";

  useEffect(() => {
    if (snapshotHash === documentHash) setCurrentHash(snapshotHash);
    else setCurrentHash(documentHash);
  }, [snapshotHash, documentHash]);

  async function handleSave() {
    if (status !== "synced") {
      if (status === "error")
        toast.error("Cannot save while document sync has failed");
      else toast.info("Wait for the document to finish syncing");

      return;
    }

    if (savingRef.current) return;

    if (source === null || documentHash !== snapshotHash) {
      toast.info(`No changes to update the ${isDraft ? "draft" : "post"}`);
      return;
    }

    savingRef.current = true;
    setIsSaving(true);

    try {
      const updateContent = isDraft ? updateDraftContent : updatePostContent;

      const result = await updateContent(contentId, source);

      if (!result.success) {
        return toast.error(`Failed to update ${isDraft}`, {
          description: result.error,
        });
      }

      savedHashRef.current = currentHash;
      toast.success(isDraft ? "Draft content updated" : "Post content updated");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";

      toast.error("Failed to save content", {
        description: message,
        duration: 5000,
      });
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  useKeyboardShortcut(
    shortcut,
    () =>
      !disabled
        ? handleSave()
        : toast.info(
            status === "synced"
              ? `No changes to update the ${isDraft ? "draft" : "post"}`
              : "Wait for the document to finish syncing",
          ),
    {
      allowInEditable: true,
      enabled: true,
    },
  );

  return (
    <Button
      type="button"
      size="lg"
      className={cn("shrink-0 left-3 top-3 absolute", className)}
      disabled={disabled}
      variant={status === "error" ? "destructive" : "default"}
      aria-busy={isBusy}
      onClick={handleSave}
    >
      {isBusy ? (
        <LoaderCircleIcon className="size-4 animate-spin" />
      ) : status === "error" ? (
        <ShieldAlertIcon className="size-4" />
      ) : (
        <SaveIcon className="size-4" />
      )}
      {label}
    </Button>
  );
}
