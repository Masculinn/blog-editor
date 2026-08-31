import { DocumentViewer } from "@/features/document-viewer";
import { ArticleContent } from "@/features/document-viewer/article-content";
import ArticleCover from "@/features/document-viewer/article-cover";
import { Editor } from "@/features/editor";
import { GuardedTools } from "@/features/tools";
import { withMDX } from "@/hoc/withMDX";
import { withPost } from "@/hoc/withPost";
import { withPostContent } from "@/hoc/withPostContent";
import { connection } from "next/server";
interface Props {
  searchParams: Promise<{
    id?: string;
    viewer?: string;
  }>;
}

const GuardedArticleCover = withPost(ArticleCover);
const GuardedArticleContent = withPost(withMDX(ArticleContent));
const GuardedEditor = withPostContent(Editor);

export default async function Page({ searchParams }: Props) {
  await connection();

  const params = await searchParams;

  const postId = typeof params.id === "string" ? Number(params.id) : undefined;
  const isViewer = params.viewer === "true";

  return (
    <main className="w-full h-screen overflow-hidden items-center justify-center-safe flex flex-row p-16">
      <GuardedTools
        postId={postId}
        className="w-1/12 h-full border-l border-y gap-1 flex flex-col p-2 items-center-safe justify-evenly rounded-l-2xl"
      />
      <GuardedEditor
        id={postId}
        className="w-6/12 h-full transition-all border-y"
      />
      {isViewer && postId && (
        <DocumentViewer className="h-full w-5/12 bg-blog-background border-r border-y rounded-r-2xl">
          <GuardedArticleCover id={postId} />
          <GuardedArticleContent id={postId} className="px-8" />
        </DocumentViewer>
      )}
    </main>
  );
}
