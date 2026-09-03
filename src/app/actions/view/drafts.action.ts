"use server";

import { db } from "@/lib/db/server";
import type { Draft } from "@/types/db.types";

export default async function viewDraftsAction(): Promise<Draft[]> {
  const { data, error } = await db
    .from("drafts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
