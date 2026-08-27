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
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/db.types";
import { formatTime } from "@/utils/formatTime";
import Image from "next/image";

export function PostCard({
  banner_image,
  description,
  published_at,
  tags,
  title,
  level,
  clasName,
  close,
}: Blog & {
  clasName?: string;
  close: () => void;
}) {
  return (
    <Card
      onClick={close}
      className={cn(
        "overflow-hidden relative md:max-h-100 h-auto py-0 bg-bg group cursor-pointer fade-in shrink-0",
        clasName,
      )}
    >
      <PostDifficulty
        level={level}
        clasName="z-50 text-xs top-4 left-4 absolute"
      />
      <CardHeader className="p-0 m-0 relative h-60 w-full">
        <Image
          fill
          loading="lazy"
          fetchPriority="auto"
          src={banner_image}
          alt={title}
          className="object-cover inset-0 z-0 object-center absolute top-0 left-0 size-full"
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
      <CardContent className="py-0 px-4 group-hover:underline underline-offset-2 decoration-muted-foreground">
        <CardTitle className="text-lg font-semibold tracking-tighter">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground md:line-clamp-2 md:pt-0 pt-2">
          {description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center-safe p-4">
        <div className="flex flex-wrap gap-1 md:w-72 w-48">
          {tags?.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
        {published_at && (
          <Badge variant="primary">
            <time className="font-secondary tabular-nums tracking-tight text-xs">
              {formatTime(published_at)}
            </time>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
