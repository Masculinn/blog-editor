"use client";

import { useSyncExternalStore } from "react";

export type DocumentSnapshot = {
  hash: string;
  source: string;
  revision: number;
};

let snapshot: DocumentSnapshot = {
  hash: "",
  source: "",
  revision: 0,
};

const listeners = new Set<() => void>();

export function publishDocumentSnapshot(
  next: Omit<DocumentSnapshot, "revision">,
) {
  if (snapshot.hash === next.hash && snapshot.source === next.source) return;

  snapshot = {
    ...next,
    revision: snapshot.revision + 1,
  };

  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

const SERVER_SNAPSHOT: DocumentSnapshot = {
  hash: "",
  source: "",
  revision: 0,
};

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useDocumentSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
