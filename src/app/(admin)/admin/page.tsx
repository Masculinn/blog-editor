import { supabaseServer } from "@/lib/db/server";

export default async function Page() {
  const { data, error } = await supabaseServer
    .from("blog_posts")
    .select("*")
    .limit(1);
  return (
    <>
      {data?.map((post) => post.id)}
      {JSON.stringify(error)}
    </>
  );
}
