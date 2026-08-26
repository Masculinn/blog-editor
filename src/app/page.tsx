import Banner from "@/features/banner";
import { Editor } from "@/features/editor";
import { DocumentViewer } from "@/features/editor/document-viewer";
import { Guide } from "@/features/guide";
import { Posts } from "@/features/posts";
import { db } from "@/lib/db/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    post?: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  await connection();

  const params = await searchParams;
  const postId = typeof params.post === "string" ? params.post : undefined;

  let documentHash: string | null = null;
  let title: string = "";
  let timestamp: string = "";

  if (postId) {
    const { data, error } = await db
      .from("small_talks")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error) return notFound();

    documentHash = data?.content_hashed ?? null;
    title = data?.title ?? "";
    timestamp = data?.timestamp ?? "";
  }

  return (
    <main className="relative size-full overflow-hidden laptop:p-12 desktop:p-12 grid grid-cols-12 grid-rows-6 place-items-center-safe font-primary">
      <section className="col-span-4 row-span-2 size-full overflow-hidden relative">
        <Guide />
      </section>
      <section className="col-span-8 row-span-1 size-full">
        <Banner />
      </section>
      <section className="row-span-6 size-full col-span-8 pl-3">
        {documentHash ? (
          <DocumentViewer
            documentHash={documentHash}
            title={title}
            timestamp={timestamp}
          />
        ) : (
          <Editor className="z-50" documentHash={documentHash} />
        )}
      </section>
      <section className="col-start-1 col-span-4 row-span-4 size-full pt-3">
        <Suspense fallback={<div className="bg-muted" />} name="posts-suspense">
          <Posts />
        </Suspense>
      </section>
    </main>
  );
}
