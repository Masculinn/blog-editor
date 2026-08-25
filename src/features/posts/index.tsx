import { Scales } from "@/components/scales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabaseServer } from "@/lib/db/server";
import { NotebookPenIcon } from "lucide-react";
import { PostCard } from "./post-card";

export async function Posts() {
  const posts = await supabaseServer
    .from("small_talks")
    .select("*")
    .order("timestamp", { ascending: false });

  if (posts.error) return null;
  return (
    <Card className="size-full pt-3 bg-transparent relative">
      <Scales
        orientation="diagonal"
        className="absolute -z-10 size-full inset-0 opacity-50"
        color="#292524"
      />

      <CardHeader>
        <CardTitle className="flex flex-row-reverse items-center gap-2 justify-between">
          <NotebookPenIcon className="size-6 inline shrink-0 text-primary" />
          <h1 className="text-3xl font-bold">Posts</h1>
        </CardTitle>
        <CardDescription>Here is what others left for you.</CardDescription>
      </CardHeader>
      <CardContent className="h-full overflow-y-scroll scrollbar-custom scroll-fade flex flex-col gap-2">
        {posts.data.map((post) => (
          <PostCard {...post} key={post.id} />
        ))}
      </CardContent>
    </Card>
  );
}
