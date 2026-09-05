"use server";

import { db } from "@/lib/db/server";
import {
  DraftSchema,
  PublishableDraftSchema,
  type DraftInput,
} from "@/schema/draft.schema";
import type { Blog, BlogInsert, BlogUpdate } from "@/types/db.types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const POST_SELECT_WITHOUT_CONTENT =
  "banner_image,description,id,level,published_at,tags,title" as const;

const POST_SELECT_WITH_CONTENT =
  "banner_image,content,description,id,level,published_at,tags,title" as const;

const PostIdSchema = z.number().int().positive();

const PostMetadataSchema = PublishableDraftSchema.omit({
  content: true,
});

const PostContentUpdateSchema = z.object({
  id: PostIdSchema,
  content: z.string(),
});

const PublishedContentSchema = PublishableDraftSchema.pick({
  content: true,
});

export type BlogWithoutContent = Omit<Blog, "content">;

type ActionError = {
  success: false;
  error: string;
};

type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | ActionError;

type DeletePostResult = { success: true } | ActionError;

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

    if (error) throw new Error(error.message);

    return data;
  }

  const { data, error } = await db
    .from("blog_posts")
    .select(POST_SELECT_WITHOUT_CONTENT)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}

export async function getPostAction(
  id: Blog["id"],
): Promise<ActionResult<BlogWithoutContent>> {
  const parsedId = PostIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: "Invalid post ID." };
  }

  const { data, error } = await db
    .from("blog_posts")
    .select(POST_SELECT_WITHOUT_CONTENT)
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Post not found." };

  return { success: true, data };
}

export async function upsertPostAction(
  id: Blog["id"],
  input: DraftInput,
): Promise<ActionResult<BlogWithoutContent>> {
  const parsedId = PostIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: "Invalid post ID." };
  }

  const parsedInput = DraftSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      success: false,
      error: parsedInput.error.issues[0]?.message ?? "Invalid post data.",
    };
  }

  const validation = PostMetadataSchema.safeParse(parsedInput.data);

  if (!validation.success) {
    return {
      success: false,
      error:
        "Published posts require a title, description, banner image, at least one tag, and a whole-number difficulty from 1 to 3.",
    };
  }

  const { data: existing, error: readError } = await db
    .from("blog_posts")
    .select(POST_SELECT_WITH_CONTENT)
    .eq("id", parsedId.data)
    .maybeSingle();

  if (readError) {
    return { success: false, error: readError.message };
  }

  if (!existing) {
    return { success: false, error: "Post not found." };
  }

  const post = {
    id: existing.id,
    banner_image: validation.data.banner_image,
    content: existing.content,
    description: validation.data.description,
    level: validation.data.level,
    published_at: existing.published_at,
    tags: validation.data.tags,
    title: validation.data.title,
  } satisfies BlogInsert;

  const { data, error } = await db
    .from("blog_posts")
    .upsert(post, { onConflict: "id" })
    .select(POST_SELECT_WITHOUT_CONTENT)
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { success: true, data };
}

export async function updatePostContent(
  id: Blog["id"],
  content: string,
): Promise<ActionResult<Pick<Blog, "id" | "content">>> {
  const validation = PostContentUpdateSchema.safeParse({
    id,
    content,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Invalid post content.",
    };
  }

  const contentValidation = PublishedContentSchema.safeParse({
    content: validation.data.content,
  });

  if (!contentValidation.success) {
    return {
      success: false,
      error:
        contentValidation.error.issues[0]?.message ??
        "Invalid published post content.",
    };
  }

  const { data, error } = await db
    .from("blog_posts")
    .update({
      content: validation.data.content satisfies BlogUpdate["content"],
    })
    .eq("id", validation.data.id)
    .select("id,content")
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return {
      success: false,
      error: "Post not found or could not be updated.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { success: true, data };
}

export async function deletePostAction(
  id: Blog["id"],
): Promise<DeletePostResult> {
  const parsedId = PostIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: "Invalid post ID." };
  }

  const { data, error } = await db
    .from("blog_posts")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Post not found." };

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { success: true };
}
