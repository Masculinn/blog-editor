import { ArrowUpRightIcon, HashIcon } from "lucide-react";

import { NewPostButton } from "@/components/new-post-button";
import { Scales } from "@/components/scales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { db } from "@/lib/db/server";
import type { SmallTalk } from "@/types/db.types";
import { formatTime } from "@/utils/formatTime";
import Link from "next/link";

export async function Posts() {
  const posts = await db
    .from("small_talks")
    .select("*")
    .order("timestamp", { ascending: false });

  if (posts.error) return null;

  return (
    <Card className="size-full  bg-transparent relative">
      <Scales
        orientation="diagonal"
        className="absolute -z-10 size-full inset-0 opacity-50"
        color="#292524"
      />

      <CardHeader>
        <CardTitle>
          <h1 className="text-3xl font-bold">Posts</h1>
        </CardTitle>
        <CardDescription>Here is what others left for you.</CardDescription>
        <CardAction>
          <NewPostButton />{" "}
        </CardAction>
      </CardHeader>
      <CardContent className="h-full overflow-y-scroll scrollbar-custom scroll-fade flex flex-col gap-2">
        {posts.data.map(({ content_hashed, user_id, ...post }) => (
          <PostCardClient {...post} key={post.id} />
        ))}
      </CardContent>
    </Card>
  );
}

function PostCardClient({
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
