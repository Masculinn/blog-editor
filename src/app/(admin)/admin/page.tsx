import { DocumentViewer } from "@/features/document-viewer";
import { ArticleContent as _ArticleContent } from "@/features/document-viewer/article-content";
import { ArticleCover as _ArticleCover } from "@/features/document-viewer/article-cover";
import { Editor as _Editor } from "@/features/editor";
import { Tools } from "@/features/tools";
import { withMDX } from "@/hoc/withMDX";
import { withPost } from "@/hoc/withPost";
import { withPostContent } from "@/hoc/withPostContent";
import { withPostMeta } from "@/hoc/withPostMeta";
import { cn } from "@/lib/utils";
import { connection } from "next/server";

export type SearchParamsRecords = {
  id: string;
  viewer: string;
  draft: string;
};

interface Props {
  searchParams: Promise<Partial<SearchParamsRecords>>;
}

const ArticleCover = withPostMeta(_ArticleCover);
const ArticleContent = withPost(withMDX(_ArticleContent));
const Editor = withPostContent(_Editor);

export default async function Page({ searchParams }: Props) {
  await connection();

  const params = await searchParams;

  const postId = typeof params.id === "string" ? Number(params.id) : undefined;
  const isViewer = params.viewer === "true";
  const draft = params.draft === "true";

  return (
    <main className="w-full h-screen overflow-hidden items-center justify-center-safe py-16 px-36 flex flex-row">
      <Tools className="w-xl bg-accent/20" />
      <Editor
        id={postId}
        draft={draft}
        className={cn(
          "h-full w-7/12 p-2",
          isViewer ? "border-y border-l rounded-l-md" : "rounded-md border",
        )}
      />
      {isViewer && postId && (
        <DocumentViewer className="w-5/12 h-full border-r border-y rounded-r-md">
          <ArticleCover id={postId} draft={draft} />
          <ArticleContent id={postId} draft={draft} />
        </DocumentViewer>
      )}
    </main>
  );
}
