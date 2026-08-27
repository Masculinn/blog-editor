import { db } from "@/lib/db/server";
import { PostsModal } from "@/modals/posts-modal";

export default async function Page() {
  const { data } = await db
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });

  return (
    <main className="w-full h-screen overflow-y-scroll scrollbar-custom scroll-fade items-center justify-center-safe flex">
      <section className="w-full h-auto grid md:grid-cols-2 grid-cols-1 my-4 gap-4 relative z-10 max-w-3xl">
        <PostsModal posts={data ?? []} />
      </section>
    </main>
  );
}
