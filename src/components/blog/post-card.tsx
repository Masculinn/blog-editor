"use client";

import { PostDifficulty } from "@/components/blog/post-difficulty";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParam } from "@/hooks/use-search-param";
import { cn } from "@/lib/utils";
import type { Blog, Draft } from "@/types/db.types";
import type { ToolItem } from "@/types/tools.types";
import { formatTime } from "@/utils/formatTime";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

type Props = (({ draft: true } & Draft) | ({ draft?: false } & Blog)) &
  ToolItem;

export function PostCard({
  banner_image,
  description,
  published_at,
  tags,
  title,
  level,
  className,
  id,
  close,
  draft,
}: Omit<Props, "content">) {
  const router = useRouter();
  const { getSearchParamsHref } = useSearchParam();

  const href = getSearchParamsHref({
    id,
    draft,
  });

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    close();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key !== "Enter") return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();

    close();

    router.push(href);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative my-4 scale-98 rounded-2xl",
        "transition-all duration-150",

        "focus-visible:scale-100",
        "focus-visible:outline-2",
        "focus-visible:outline-primary",
        "focus-visible:outline-offset-2",

        "first:ml-2",

        "motion-reduce:transform-none",
        "motion-reduce:transition-none",
      )}
    >
      <Card
        className={cn(
          "relative h-auto shrink-0 cursor-pointer",
          "overflow-hidden bg-bg py-0 fade-in",

          "md:max-h-100",

          "transition-colors",

          "group-hover:bg-primary/5",
          "group-focus-visible:bg-primary/10",

          className,
        )}
      >
        <PostDifficulty
          level={level}
          clasName="absolute top-4 left-4 z-50 text-xs"
        />

        <CardHeader className="relative m-0 h-60 w-full p-0">
          {banner_image && (
            <Image
              fill
              loading="lazy"
              fetchPriority="auto"
              src={banner_image}
              alt={title ?? "Post banner"}
              className="absolute inset-0 z-0 size-full object-cover object-center"
            />
          )}
        </CardHeader>

        <CardContent
          className={cn(
            "px-4 py-0",
            "decoration-muted-foreground",
            "underline-offset-2",

            "group-hover:underline",
            "group-focus-visible:underline",
          )}
        >
          <CardTitle className="text-lg font-semibold tracking-tighter">
            {title}
          </CardTitle>

          <p className="pt-2 text-sm text-muted-foreground md:line-clamp-2 md:pt-0">
            {description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center-safe justify-between p-4">
          <div className="flex w-48 flex-wrap gap-1 md:w-72">
            {tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {published_at && (
            <Badge variant="primary">
              <time className="font-secondary text-xs tracking-tight tabular-nums">
                {formatTime(published_at)}
              </time>
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
