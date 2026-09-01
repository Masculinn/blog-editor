import "server-only";

import { db } from "@/lib/db/server";
import type { Database } from "@/types/database.types";
import { notFound } from "next/navigation";

type SmallTalk = Database["public"]["Tables"]["small_talks"]["Row"];

export async function getSmallTalk(id: string): Promise<SmallTalk | null> {
  const { data, error } = await db
    .from("small_talks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return notFound();

  return data;
}
