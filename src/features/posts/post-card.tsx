"use client";

import { ArrowUpRightIcon, HashIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { SmallTalk } from "@/types/supabase";
import { formatTime } from "@/utils/formatTime";
import Link from "next/link";

export function PostCard({
  id,
  title,
  timestamp,
}: Omit<SmallTalk, "content_hashed" | "user_id">) {
  return (
    <Item
      render={
        <Link
          href={{
            pathname: "/",
            query: {
              post: String(id),
            },
          }}
          scroll={false}
        />
      }
      variant="outline"
      size="sm"
      data-post-id={id}
      className="rounded-md group"
    >
      <ItemMedia variant="icon">
        <HashIcon className="size-3.5 text-muted-foreground" />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="truncate line-clamp-1 max-w-64">
          {title}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Badge
          className="shrink-0 text-[10px] font-secondary tracking-tighter"
          variant="default"
        >
          {formatTime(timestamp)}
        </Badge>
        <Button
          size="icon-xs"
          variant="ghost"
          className="animate-in transition-all duration-300 group-hover:rotate-45"
        >
          <ArrowUpRightIcon />
        </Button>
      </ItemActions>
    </Item>
  );
}
