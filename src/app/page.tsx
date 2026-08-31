import Banner from "@/components/banner";
import { Guide } from "@/components/guide";
import { Posts } from "@/components/posts";
import { PostsSkeleton } from "@/components/skeleton/posts-skeleton";
import { ExperimentalDocumentViewer } from "@/features/document-viewer/experimental-viewer";
import { ExperimentalEditor } from "@/features/editor/experimental-editor";
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
  let title = "";
  let timestamp = "";

  if (postId) {
    const { data, error } = await db
      .from("small_talks")
      .select("*")
      .eq("id", postId)
      .maybeSingle();

    if (error) {
      return notFound();
    }

    documentHash = data?.content_hashed ?? null;
    title = data?.title ?? "";
    timestamp = data?.timestamp ?? "";
  }

  return (
    <main
      className="
        relative
        grid
        min-h-dvh
        w-full
        grid-cols-1
        gap-3
        overflow-x-hidden
        overflow-y-auto
        p-3
        font-primary

        laptop:h-dvh
        laptop:grid-cols-12
        laptop:grid-rows-6
        laptop:gap-0
        laptop:overflow-hidden
        laptop:p-12

        desktop:p-12
      "
    >
      <section
        className="
          min-w-0
          w-full

          laptop:col-start-5
          laptop:col-span-8
          laptop:row-start-1
          laptop:row-span-1
          laptop:h-full
        "
      >
        <Banner />
      </section>

      <section
        className="
          relative
          min-h-64
          min-w-0
          w-full
          overflow-hidden

          laptop:col-start-1
          laptop:col-span-4
          laptop:row-start-1
          laptop:row-span-2
          laptop:h-full
          laptop:min-h-0
        "
      >
        <Guide />
      </section>

      <section
        className="
          min-w-0
          w-full
          pb-3

          laptop:col-start-1
          laptop:col-span-4
          laptop:row-start-3
          laptop:row-span-4
          laptop:h-full
          laptop:pt-3
          laptop:pb-0
        "
      >
        <Suspense fallback={<PostsSkeleton />} name="posts-suspense">
          <Posts />
        </Suspense>
      </section>

      <section
        className="
          min-h-[70dvh]
          min-w-0
          w-full

          laptop:col-start-5
          laptop:col-span-8
          laptop:row-start-2
          laptop:row-span-5
          laptop:h-full
          laptop:min-h-0
          laptop:pl-3
        "
      >
        {documentHash ? (
          <ExperimentalDocumentViewer
            documentHash={documentHash}
            title={title}
            timestamp={timestamp}
          />
        ) : (
          <ExperimentalEditor className="z-50" documentHash={documentHash} />
        )}
      </section>
    </main>
  );
}
