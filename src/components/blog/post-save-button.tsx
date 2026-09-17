"use client";

import { useHash } from "@/hooks/use-hash";
import type { KeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { cn } from "@/lib/utils";
import settings from "@/settings/client";
import { useDocumentSnapshot } from "@/store/document.store";
import { useSyncStore } from "@/store/sync.store";
import { LoaderCircleIcon, SaveIcon, ShieldAlertIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

type Props = {
  hasChanges: boolean;
  onSave: () => Promise<void>;
  className?: string;
  isDraft?: boolean;
};

const shortcut = settings.shortcuts.saveContent as unknown as KeyboardShortcut;

export function PostSaveButton({
  hasChanges,
  onSave,
  className,
  isDraft,
}: Props) {
  const savingRef = useRef(false);

  const [isSaving, setIsSaving] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const syncStatus = useSyncStore((state) => state.syncStatus);

  const hash = useHash();
  const snapshot = useDocumentSnapshot();

  useEffect(() => {
    if (snapshot.hash === hash) {
      setCurrentHash(snapshot.hash);
    }
  }, [hash, snapshot.hash]);

  const hasDocumentHash = hash.startsWith("#doc=");

  const isSyncPending = syncStatus === "loading" || syncStatus === "syncing";
  const isBusy = isSaving || isSyncPending;
  const disabled = syncStatus !== "synced" || !hasChanges || isSaving;

  const label = isSaving
    ? "Saving…"
    : syncStatus === "loading"
      ? "Loading…"
      : syncStatus === "syncing"
        ? "Syncing…"
        : syncStatus === "error"
          ? "Sync failed"
          : "Save Changes";

  return (
    <Button
      type="button"
      size="lg"
      className={cn("shrink-0 left-3 top-3 absolute", className)}
      disabled={disabled}
      variant={syncStatus === "error" ? "destructive" : "default"}
      aria-busy={isBusy}
      onClick={onSave}
    >
      {isBusy ? (
        <LoaderCircleIcon className="size-4 animate-spin" />
      ) : syncStatus === "error" ? (
        <ShieldAlertIcon className="size-4" />
      ) : (
        <SaveIcon className="size-4" />
      )}

      {label}
    </Button>
  );
}
