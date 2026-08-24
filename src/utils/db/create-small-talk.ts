import "server-only";

import { supabaseServer } from "@/lib/db/server";
import type { Database } from "@/types/database.types";

type SmallTalk = Database["public"]["Tables"]["small_talks"]["Row"];

type CreateSmallTalkInput = {
  contentHashed: string;
  userId: string;
};

export async function createSmallTalk({
  contentHashed,
  userId,
}: CreateSmallTalkInput): Promise<SmallTalk> {
  const { data, error } = await supabaseServer
    .from("small_talks")
    .insert({
      content_hashed: contentHashed,
      user_id: userId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Could not create small talk: ${error.message}`);
  }

  return data;
}
