"use client";

import { PostDifficulty } from "@/components/blog/post-difficulty";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/db.types";
import { formatTime } from "@/utils/formatTime";
import Image from "next/image";

type CoverProps = Omit<Blog, "content" | "description" | "id">;

export function ArticleCover({
  banner_image,
  level,
  published_at,
  title,
}: CoverProps) {
  return (
    <header
      className={cn(
        "md:h-auto md:min-h-80 h-auto w-full",
        "overflow-hidden relative md:p-12 p-6 mb-8",
        "flex items-center-safe justify-center ",
      )}
      tabIndex={-1}
    >
      <h1 className="font-bold tracking-tighter max-w-2xl text-shadow-2xs z-50 text-4xl md:text-5xl my-16 text-foreground">
        {title}
      </h1>
      {published_at && (
        <time className="font-secondary text-xs absolute md:bottom-6 md:right-6 bottom-4 right-4 z-50">
          {formatTime(published_at)}
        </time>
      )}
      <Image
        alt={title}
        src={banner_image}
        loading="lazy"
        fill
        className="absolute inset-0 object-cover md:object-center size-full -z-10 "
      />
      <PostDifficulty
        level={level}
        clasName="z-50 text-xs top-4 right-4 absolute"
      />
      <div className="bg-linear-to-b from-transparent dark:to-80% to-background size-full object-contain absolute inset-0" />
      {/* {readingTime && (
        <Badge
          variant="outline"
          className="absolute bottom-4 left-4 z-50 font-secondary font-extralight"
        >
          <Timer />
          {Math.ceil(readingTime)} min
        </Badge>
      )} */}
    </header>
  );
}
