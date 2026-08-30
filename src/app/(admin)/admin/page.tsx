import { DocumentViewer } from "@/features/document-viewer";
import ArticleCover from "@/features/document-viewer/article-cover";
import { ToggleViewer } from "@/features/document-viewer/toggle-viewer";
import { Editor } from "@/features/editor";
import { withPosts } from "@/hoc/withAllPosts";
import { withPost } from "@/hoc/withPost";
import { withPostContent } from "@/hoc/withPostContent";
import { PostsModal } from "@/modals/posts-modal";
import { connection } from "next/server";

interface Props {
  searchParams: Promise<{
    id?: string;
    viewer?: string;
  }>;
}

const GuardedPostsModal = withPosts(PostsModal);
const GuardedArticleCover = withPost(ArticleCover);
const GuardedEditor = withPostContent(Editor);

export default async function Page({ searchParams }: Props) {
  await connection();

  const params = await searchParams;

  const postId = typeof params.id === "string" ? Number(params.id) : undefined;
  const isViewer = params.viewer === "true";

  return (
    <main className="w-full h-screen overflow-hidden items-center justify-center-safe flex flex-row gap-2 px-4 py-8">
      <GuardedEditor
        id={postId}
        className="w-1/2 h-full transition-all"
        navChildren={<GuardedPostsModal />}
      >
        <ToggleViewer />
      </GuardedEditor>

      {isViewer && postId && (
        <DocumentViewer className="h-full w-162.5">
          <GuardedArticleCover id={postId} />
        </DocumentViewer>
      )}
    </main>
  );
}
