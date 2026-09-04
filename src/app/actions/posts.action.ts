"use server";

import { db } from "@/lib/db/server";
import type { Blog } from "@/types/db.types";
import { z } from "zod";

const POST_SELECT_WITHOUT_CONTENT =
  "banner_image,description,id,level,published_at,tags,title" as const;

const POST_SELECT_WITH_CONTENT =
  "banner_image,content,description,id,level,published_at,tags,title" as const;

const PostIdSchema = z.number().int().positive();

export type BlogWithoutContent = Omit<Blog, "content">;

type DeletePostResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function viewPostsAction(includeContent: true): Promise<Blog[]>;
export async function viewPostsAction(
  includeContent?: false,
): Promise<BlogWithoutContent[]>;

export async function viewPostsAction(
  includeContent = false,
): Promise<Blog[] | BlogWithoutContent[]> {
  if (includeContent) {
    const { data, error } = await db
      .from("blog_posts")
      .select(POST_SELECT_WITH_CONTENT)
      .order("published_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  const { data, error } = await db
    .from("blog_posts")
    .select(POST_SELECT_WITHOUT_CONTENT)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deletePostAction(
  id: Blog["id"],
): Promise<DeletePostResult> {
  const parsedId = PostIdSchema.safeParse(id);

  if (!parsedId.success) {
    return {
      success: false,
      error: "Invalid post ID.",
    };
  }

  const { data, error } = await db
    .from("blog_posts")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Post not found.",
    };
  }

  return {
    success: true,
  };
}
