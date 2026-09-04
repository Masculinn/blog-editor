"use server";

import { db } from "@/lib/db/server";
import type { Blog } from "@/types/db.types";

export default async function viewPostsAction(): Promise<Blog[]> {
  const { data, error } = await db
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
