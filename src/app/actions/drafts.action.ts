"use server";

import { db } from "@/lib/db/server";
import { getDraftPublishIssues } from "@/lib/draft";
import {
  DraftSchema,
  PublishableDraftSchema,
  type DraftInput,
} from "@/schema/draft.schema";
import type { Blog, BlogInsert, Draft, DraftInsert } from "@/types/db.types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DRAFT_SELECT_WITHOUT_CONTENT =
  "banner_image,description,id,level,published_at,tags,title" as const;

const DRAFT_SELECT_WITH_CONTENT =
  "banner_image,content,description,id,level,published_at,tags,title" as const;

const BLOG_SELECT_WITHOUT_CONTENT =
  "banner_image,description,id,level,published_at,tags,title" as const;

const BLOG_SELECT_WITH_CONTENT =
  "banner_image,content,description,id,level,published_at,tags,title" as const;

const DraftIdSchema = z.number().int().positive();

export type DraftWithoutContent = Omit<Draft, "content">;
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

type PublishDraftResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      issues?: string[];
    };

type DeleteDraftResult = { success: true } | ActionError;

function toDraftMetadata(input: DraftInput) {
  return {
    banner_image: input.banner_image,
    description: input.description,
    level: input.level,
    tags: input.tags,
    title: input.title,
  } satisfies DraftInsert;
}

async function viewDraftsAction(includeContent: true): Promise<Draft[]>;
async function viewDraftsAction(
  includeContent?: false,
): Promise<DraftWithoutContent[]>;
async function viewDraftsAction(
  includeContent = false,
): Promise<Draft[] | DraftWithoutContent[]> {
  if (includeContent) {
    const { data, error } = await db
      .from("drafts")
      .select(DRAFT_SELECT_WITH_CONTENT)
      .order("published_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await db
    .from("drafts")
    .select(DRAFT_SELECT_WITHOUT_CONTENT)
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export default viewDraftsAction;

export async function getDraftAction(
  id: Draft["id"],
): Promise<ActionResult<DraftWithoutContent>> {
  const parsedId = DraftIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: "Invalid draft ID." };
  }

  const { data, error } = await db
    .from("drafts")
    .select(DRAFT_SELECT_WITHOUT_CONTENT)
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Draft not found." };

  return { success: true, data };
}

export async function createDraftAction(
  input: DraftInput,
  includeContent: true,
): Promise<ActionResult<Draft>>;
export async function createDraftAction(
  input: DraftInput,
  includeContent?: false,
): Promise<ActionResult<DraftWithoutContent>>;
export async function createDraftAction(
  input: DraftInput,
  includeContent = false,
): Promise<ActionResult<Draft> | ActionResult<DraftWithoutContent>> {
  const validation = DraftSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Invalid draft data.",
    };
  }

  const draft = toDraftMetadata(validation.data);

  if (includeContent) {
    const { data, error } = await db
      .from("drafts")
      .insert(draft)
      .select(DRAFT_SELECT_WITH_CONTENT)
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin");
    return { success: true, data };
  }

  const { data, error } = await db
    .from("drafts")
    .insert(draft)
    .select(DRAFT_SELECT_WITHOUT_CONTENT)
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true, data };
}

export async function upsertDraftAction(
  id: Draft["id"],
  input: DraftInput,
): Promise<ActionResult<Draft>> {
  const parsedId = DraftIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: "Invalid draft ID." };
  }

  const validation = DraftSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Invalid draft data.",
    };
  }

  const { data: existing, error: readError } = await db
    .from("drafts")
    .select(DRAFT_SELECT_WITH_CONTENT)
    .eq("id", parsedId.data)
    .maybeSingle();

  if (readError) return { success: false, error: readError.message };
  if (!existing) return { success: false, error: "Draft not found." };

  const draft = {
    ...toDraftMetadata(validation.data),
    id: existing.id,
    content: existing.content,
    published_at: existing.published_at,
  } satisfies DraftInsert;

  const { data, error } = await db
    .from("drafts")
    .upsert(draft, { onConflict: "id" })
    .select(DRAFT_SELECT_WITH_CONTENT)
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true, data };
}

export async function deleteDraftAction(
  id: Draft["id"],
): Promise<DeleteDraftResult> {
  const parsedId = DraftIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: "Invalid draft ID." };
  }

  const { data, error } = await db
    .from("drafts")
    .delete()
    .eq("id", parsedId.data)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Draft not found." };

  revalidatePath("/admin");
  return { success: true };
}

async function finishPublishing<T extends Blog | BlogWithoutContent>(
  draftId: Draft["id"],
  publishedBlog: T,
): Promise<PublishDraftResult<T>> {
  const { data: deletedDraft, error: deleteError } = await db
    .from("drafts")
    .delete()
    .eq("id", draftId)
    .select("id")
    .maybeSingle();

  if (deleteError || !deletedDraft) {
    const { error: rollbackError } = await db
      .from("blog_posts")
      .delete()
      .eq("id", publishedBlog.id);

    if (rollbackError) {
      revalidatePath("/admin");
      revalidatePath("/", "layout");

      return {
        success: false,
        error:
          "The post was published, but the draft could not be removed. " +
          `Rollback also failed: ${rollbackError.message}`,
      };
    }

    return {
      success: false,
      error:
        deleteError?.message ??
        "The draft could not be removed after publishing.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { success: true, data: publishedBlog };
}

export async function publishDraftAction(
  id: Draft["id"],
  includeContent: true,
): Promise<PublishDraftResult<Blog>>;
export async function publishDraftAction(
  id: Draft["id"],
  includeContent?: false,
): Promise<PublishDraftResult<BlogWithoutContent>>;
export async function publishDraftAction(
  id: Draft["id"],
  includeContent = false,
): Promise<PublishDraftResult<Blog> | PublishDraftResult<BlogWithoutContent>> {
  const parsedId = DraftIdSchema.safeParse(id);

  if (!parsedId.success) {
    return { success: false, error: "Invalid draft ID." };
  }

  const { data: draft, error: draftError } = await db
    .from("drafts")
    .select(DRAFT_SELECT_WITH_CONTENT)
    .eq("id", parsedId.data)
    .maybeSingle();

  if (draftError) return { success: false, error: draftError.message };
  if (!draft) return { success: false, error: "Draft not found." };

  const validation = PublishableDraftSchema.safeParse(draft);

  if (!validation.success) {
    return {
      success: false,
      error: "Draft does not meet the publishing requirements.",
      issues: getDraftPublishIssues(draft),
    };
  }

  const { banner_image, content, description, level, tags, title } =
    validation.data;

  const blog = {
    banner_image,
    content,
    description,
    level,
    published_at: new Date().toISOString(),
    tags,
    title,
  } satisfies BlogInsert;

  if (includeContent) {
    const { data, error } = await db
      .from("blog_posts")
      .insert(blog)
      .select(BLOG_SELECT_WITH_CONTENT)
      .single();

    if (error) return { success: false, error: error.message };
    return finishPublishing(parsedId.data, data);
  }

  const { data, error } = await db
    .from("blog_posts")
    .insert(blog)
    .select(BLOG_SELECT_WITHOUT_CONTENT)
    .single();

  if (error) return { success: false, error: error.message };
  return finishPublishing(parsedId.data, data);
}
