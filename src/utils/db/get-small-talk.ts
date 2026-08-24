import "server-only";

import { supabaseServer } from "@/lib/db/server";
import type { Database } from "@/types/database.types";

type SmallTalk = Database["public"]["Tables"]["small_talks"]["Row"];

export async function getSmallTalk(id: string): Promise<SmallTalk | null> {
  const { data, error } = await supabaseServer
    .from("small_talks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not get small talk: ${error.message}`);
  }

  return data;
}
