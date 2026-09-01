import { DocumentViewer } from "@/features/document-viewer";
import { ArticleContent as _ArticleContent } from "@/features/document-viewer/article-content";
import { ArticleCover as _ArticleCover } from "@/features/document-viewer/article-cover";
import { Editor as _Editor } from "@/features/editor";
import { Tools } from "@/features/tools";
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

const ArticleCover = withPost(_ArticleCover);
const ArticleContent = withPost(withMDX(_ArticleContent));
const Editor = withPostContent(_Editor);

export default async function Page({ searchParams }: Props) {
  await connection();

  const params = await searchParams;

  const postId = typeof params.id === "string" ? Number(params.id) : undefined;
  const isViewer = params.viewer === "true";

  return (
    <main className="w-full h-screen overflow-hidden items-center justify-center-safe p-16 flex flex-row">
      <Tools postId={postId} />
      <Editor
        id={postId}
        className="h-full w-7/12 border-y border-l rounded-l-md p-4"
      />
      {isViewer && postId && (
        <DocumentViewer className="w-5/12 h-full border-r border-y rounded-r-md">
          <ArticleCover id={postId} />
          <ArticleContent id={postId} className="px-8" />
        </DocumentViewer>
      )}
    </main>
  );
}
