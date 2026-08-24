// src/utils/db/small-talks/delete-small-talk.ts

import "server-only";

import { supabaseServer } from "@/lib/db/server";

type DeleteSmallTalkInput = {
  id: string;
  userId: string;
};

export async function deleteSmallTalk({
  id,
  userId,
}: DeleteSmallTalkInput): Promise<boolean> {
  const { data, error } = await supabaseServer
    .from("small_talks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Could not delete small talk: ${error.message}`);
  }

  return data !== null;
}
