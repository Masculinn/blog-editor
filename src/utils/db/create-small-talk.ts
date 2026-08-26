import "server-only";

import { db } from "@/lib/db/server";
import type { SmallTalk } from "@/types/supabase";

type CreateSmallTalkInput = {
  contentHashed: string;
  title: string;
  userId: string;
};

export async function createSmallTalk({
  contentHashed,
  title,
  userId,
}: CreateSmallTalkInput): Promise<SmallTalk> {
  const { data, error } = await db
    .from("small_talks")
    .insert({
      content_hashed: contentHashed,
      title,
      user_id: userId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Could not create small talk: ${error.message}`);
  }

  return data;
}
