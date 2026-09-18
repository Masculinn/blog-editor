"use client";

import { useSyncExternalStore } from "react";

const events: Array<keyof WindowEventMap> = ["hashchange", "popstate"];

function subscribe(callback: () => void): () => void {
  const controller = new AbortController();

  for (const ev of events) {
    window.addEventListener(ev, callback, {
      signal: controller.signal,
    });
  }

  return () => controller.abort();
}

function getSnapshot(): string {
  return window.location.hash;
}

function getServerSnapshot(): string {
  return "";
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
