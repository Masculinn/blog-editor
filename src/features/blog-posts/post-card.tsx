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
import type { Blog } from "@/types/db.types";
import { formatTime } from "@/utils/formatTime";
import Image from "next/image";
import Link from "next/link";

export function PostCard({
  banner_image,
  description,
  published_at,
  tags,
  title,
  level,
  clasName,
  id,
  close,
}: Blog & {
  clasName?: string;
  close: () => void;
}) {
  const { getSearchParamHref } = useSearchParam();

  return (
    <Link
      href={getSearchParamHref("id", id)}
      onClick={close}
      className="group relative my-4 rounded-2xl transition-all duration-150 focus:scale-90 focus:outline-2 focus:outline-primary"
    >
      <Card
        className={cn(
          "relative h-auto shrink-0 cursor-pointer overflow-hidden bg-bg py-0 fade-in md:max-h-100",
          clasName,
        )}
      >
        <PostDifficulty
          level={level}
          clasName="absolute top-4 left-4 z-50 text-xs"
        />

        <CardHeader className="relative m-0 h-60 w-full p-0">
          <Image
            fill
            loading="lazy"
            fetchPriority="auto"
            src={banner_image}
            alt={title}
            className="absolute inset-0 z-0 size-full object-cover object-center"
          />

          <div className="blog-card-shape-divider">
            <svg
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <title>image shape divider</title>
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                className="shape-fill"
              />
            </svg>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-0 decoration-muted-foreground underline-offset-2 group-hover:underline">
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
