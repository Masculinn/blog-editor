"use client";

import { create } from "zustand";

export type SyncStatus = "loading" | "syncing" | "synced" | "error";

type SyncStore = {
  syncStatus: SyncStatus;
  setSyncStatus: (syncStatus: SyncStatus) => void;
};

export const useSyncStore = create<SyncStore>()((set) => ({
  syncStatus: "loading",

  setSyncStatus: (syncStatus) => {
    set((state) => {
      if (state.syncStatus === syncStatus) return state;
      return { syncStatus };
    });
  },
}));
