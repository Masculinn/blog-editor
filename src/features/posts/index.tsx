import { NewPostButton } from "@/components/new-post-button";
import { Scales } from "@/components/scales";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/server";
import { PostCard } from "./post-card";

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
          <PostCard {...post} key={post.id} />
        ))}
      </CardContent>
    </Card>
  );
}
