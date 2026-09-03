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
import {
  Fragment,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";

type InteractiveDraftProps = Omit<Draft, "content"> &
  ToolItem & {
    draft: true;
    static?: false;
  };

type InteractiveBlogProps = Omit<Blog, "content"> &
  ToolItem & {
    draft?: false;
    static?: false;
  };

type StaticProps = Partial<Omit<Draft, "content">> &
  Partial<ToolItem> & {
    draft?: true;
    static: true;
  };

type Props = InteractiveDraftProps | InteractiveBlogProps | StaticProps;

export function PostCard(props: Props) {
  const router = useRouter();
  const { getSearchParamsHref } = useSearchParam();

  const {
    banner_image,
    description,
    published_at,
    tags,
    title,
    level,
    className,
  } = props;

  const card: ReactNode = (
    <Card
      className={cn(
        "relative h-auto shrink-0",
        "overflow-hidden bg-bg py-0 fade-in",

        "md:max-h-100",

        "transition-colors",

        !props.static && [
          "cursor-pointer",
          "group-hover:bg-primary/5",
          "group-focus-visible:bg-primary/10",
        ],

        className,
      )}
    >
      {level && (
        <PostDifficulty
          level={level}
          clasName="absolute top-4 left-4 z-50 text-xs"
        />
      )}

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

          !props.static && [
            "group-hover:underline",
            "group-focus-visible:underline",
          ],
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
  );

  if (props.static) {
    return <Fragment>{card}</Fragment>;
  }

  const href = getSearchParamsHref({
    id: props.id,
    draft: props.draft,
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

    toast.info(`Viewing ${props.draft ? "draft" : "post"}...`, {
      description: title,
      position: "top-right",
    });

    props.close();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== "Enter") return;

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();

    toast.info(`Now viewing ${props.draft ? "draft" : "post"}...`, {
      description: `Title: ${title}`,
    });

    props.close();
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
      {card}
    </Link>
  );
}
