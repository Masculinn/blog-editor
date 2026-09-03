"use server";

import { db } from "@/lib/db/server";
import { type DraftInput, DraftSchema } from "@/schema/draft.schema";
import type { DraftInsert } from "@/types/db.types";

export default async function createDraftAction(input: DraftInput) {
  const result = DraftSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false as const,
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

  const { data, error } = await db
    .from("drafts")
    .insert(draft)
    .select()
    .single();

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  return {
    success: true as const,
    data,
  };
}
