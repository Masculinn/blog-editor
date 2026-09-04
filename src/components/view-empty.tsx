"use client";

import {
  FilePenLineIcon,
  InboxIcon,
  RefreshCwIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "./ui/button";

export function ViewEmpty({
  onRefresh,
  desc,
  title,
}: {
  onRefresh: () => Promise<void>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex min-h-96 min-w-full items-center justify-start">
      <div className="relative w-full overflow-hidden rounded-3xl border bg-card/20 shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-muted/60 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
        />
        <div className="relative flex flex-col items-center px-4 py-8 text-center sm:px-10 sm:py-14">
          <div className="relative mb-6">
            <div className="flex size-20 items-center justify-center rounded-2xl border bg-background shadow-sm">
              <InboxIcon className="size-9 text-muted-foreground" />
            </div>
            <div className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border bg-card shadow-sm">
              <SparklesIcon className="size-3.5 text-primary" />
            </div>
            <div className="absolute -bottom-2 -left-2 flex size-9 items-center justify-center rounded-xl border bg-card shadow-sm">
              <FilePenLineIcon className="size-4 text-muted-foreground" />
            </div>
          </div>
          <div className="max-w-sm space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {desc}
            </p>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <Button
              type="button"
              variant="default"
              size={"lg"}
              onClick={() => void onRefresh()}
            >
              <RefreshCwIcon className="size-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
