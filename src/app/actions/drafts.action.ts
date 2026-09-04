"use server";

import { db } from "@/lib/db/server";
import { getDraftPublishIssues } from "@/lib/draft";
import {
  type DraftInput,
  DraftSchema,
  PublishableDraftSchema,
} from "@/schema/draft.schema";

import type { Blog, BlogInsert, Draft, DraftInsert } from "@/types/db.types";
import { revalidatePath } from "next/cache";

const DRAFT_SELECT_WITHOUT_CONTENT =
  "banner_image,description,id,level,published_at,tags,title" as const;

const DRAFT_SELECT_WITH_CONTENT =
  "banner_image,content,description,id,level,published_at,tags,title" as const;

const BLOG_SELECT_WITHOUT_CONTENT =
  "banner_image,description,id,level,published_at,tags,title" as const;

const BLOG_SELECT_WITH_CONTENT =
  "banner_image,content,description,id,level,published_at,tags,title" as const;

export type DraftWithoutContent = Omit<Draft, "content">;

export type BlogWithoutContent = Omit<Blog, "content">;

type ActionError = {
  success: false;
  error: string;
};

type CreateDraftResult<T> =
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

type DeleteDraftResult =
  | {
      success: true;
    }
  | ActionError;

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

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  const { data, error } = await db
    .from("drafts")
    .select(DRAFT_SELECT_WITHOUT_CONTENT)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export default viewDraftsAction;

export async function createDraftAction(
  input: DraftInput,
  includeContent: true,
): Promise<CreateDraftResult<Draft>>;

export async function createDraftAction(
  input: DraftInput,
  includeContent?: false,
): Promise<CreateDraftResult<DraftWithoutContent>>;

export async function createDraftAction(
  input: DraftInput,
  includeContent = false,
): Promise<CreateDraftResult<Draft> | CreateDraftResult<DraftWithoutContent>> {
  const result = DraftSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid draft data.",
    };
  }

  const draft = {
    banner_image: result.data.banner_image,
    description: result.data.description,
    level: result.data.level,
    tags: result.data.tags,
    title: result.data.title,
  } satisfies DraftInsert;

  if (includeContent) {
    const { data, error } = await db
      .from("drafts")
      .insert(draft)
      .select(DRAFT_SELECT_WITH_CONTENT)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/admin");

    return {
      success: true,
      data,
    };
  }

  const { data, error } = await db
    .from("drafts")
    .insert(draft)
    .select(DRAFT_SELECT_WITHOUT_CONTENT)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
    data,
  };
}

export async function deleteDraftAction(
  id: Draft["id"],
): Promise<DeleteDraftResult> {
  const { data, error } = await db
    .from("drafts")
    .delete()
    .eq("id", id)
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
      error: "Draft not found.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
  };
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
  const { data: draft, error: draftError } = await db
    .from("drafts")
    .select(DRAFT_SELECT_WITH_CONTENT)
    .eq("id", id)
    .maybeSingle();

  if (draftError) {
    return {
      success: false,
      error: draftError.message,
    };
  }

  if (!draft) {
    return {
      success: false,
      error: "Draft not found.",
    };
  }

  const validation = PublishableDraftSchema.safeParse(draft);

  if (!validation.success) {
    const issues = getDraftPublishIssues(draft);

    return {
      success: false,
      error: "Draft does not meet the publishing requirements.",
      issues,
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
    const { data: publishedBlog, error: publishError } = await db
      .from("blog_posts")
      .insert(blog)
      .select(BLOG_SELECT_WITH_CONTENT)
      .single();

    if (publishError) {
      return {
        success: false,
        error: publishError.message,
      };
    }

    const { data: deletedDraft, error: deleteError } = await db
      .from("drafts")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (deleteError || !deletedDraft) {
      const { error: rollbackError } = await db
        .from("blog_posts")
        .delete()
        .eq("id", publishedBlog.id);

      if (rollbackError) {
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

    return {
      success: true,
      data: publishedBlog,
    };
  }

  const { data: publishedBlog, error: publishError } = await db
    .from("blog_posts")
    .insert(blog)
    .select(BLOG_SELECT_WITHOUT_CONTENT)
    .single();

  if (publishError) {
    return {
      success: false,
      error: publishError.message,
    };
  }

  const { data: deletedDraft, error: deleteError } = await db
    .from("drafts")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (deleteError || !deletedDraft) {
    const { error: rollbackError } = await db
      .from("blog_posts")
      .delete()
      .eq("id", publishedBlog.id);

    if (rollbackError) {
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

  return {
    success: true,
    data: publishedBlog,
  };
}
