import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, FileQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <main
      aria-labelledby="not-found-heading"
      className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-muted sm:h-20 sm:w-20"
      >
        <FileQuestion className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          Error 404
        </p>
        <h1
          id="not-found-heading"
          className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Post not found
        </h1>
        <p className="max-w-md text-balance text-sm text-muted-foreground sm:text-base">
          This post does not exist.
        </p>
      </div>

      <Button
        render={<Link href={"/admin"} aria-label="Return to editor page" />}
        size="lg"
        nativeButton={false}
        className="mt-2"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Editor
      </Button>
    </main>
  );
}
