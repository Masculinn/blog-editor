import type { Database } from "@/types/database.types";

type Tables = Database["public"]["Tables"];

export type Blog = Tables["blog_posts"]["Row"];
export type BlogInsert = Tables["blog_posts"]["Insert"];
export type BlogUpdate = Tables["blog_posts"]["Update"];

export type SmallTalk = Tables["small_talks"]["Row"];

export type Draft = Tables["drafts"]["Row"];
export type DraftInsert = Tables["drafts"]["Insert"];
export type DraftUpdate = Tables["drafts"]["Update"];
