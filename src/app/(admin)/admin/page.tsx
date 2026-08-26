import { db } from "@/lib/db/server";

export default async function Page() {
  const { data } = await db.from("blog_posts").select("*");
  return <>{data?.map((post) => post.id)}</>;
}
