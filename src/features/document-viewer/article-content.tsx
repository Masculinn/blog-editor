"use client";

import { updateDraftContent } from "@/app/actions/drafts.action";
import { updatePostContent } from "@/app/actions/posts.action";
import { serializeMDXAction } from "@/app/actions/serialize.action";
import { MDXComponents } from "@/components/mdx/mdx-components";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useSearchParam } from "@/hooks/use-search-param";
import { isSerializedMDXWithError } from "@/lib/mdx/isSerializedMDXWithError";
import type { MDXRecord, SerializedMDXSource } from "@/lib/mdx/serializeMDX";
import { useDocumentSnapshot } from "@/store/document.store";
import type { Blog } from "@/types/db.types";
import { LoaderCircleIcon, SaveIcon } from "lucide-react";
import { MDXClient } from "next-mdx-remote-client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArticleErrorModal } from "./article-error-modal";

type Props = Blog & SerializedMDXSource;

type ArticleContentBodyProps = {
  article: Props;
  isDraft: boolean;
};

function getInitialMdxSource(props: Props): SerializedMDXSource {
  if (isSerializedMDXWithError(props)) {
    return {
      error: props.error,
      frontmatter: props.frontmatter,
      scope: props.scope,
    };
  }

  return {
    compiledSource: props.compiledSource,
    frontmatter: props.frontmatter,
    scope: props.scope,
  };
}

export function ArticleContent(props: Props) {
  const { getSearchParam } = useSearchParam();

  const isDraft = getSearchParam("draft") === "true";

  return (
    <ArticleContentBody
      key={JSON.stringify([isDraft, props.id, props.content])}
      article={props}
      isDraft={isDraft}
    />
  );
}

function ArticleContentBody({ article, isDraft }: ArticleContentBodyProps) {
  const {
    banner_image,
    description,
    id,
    level,
    published_at,
    tags,
    title,
    content,
  } = article;

  const [initialMdxSource] = useState<SerializedMDXSource>(() =>
    getInitialMdxSource(article),
  );

  const [mdxSource, setMdxSource] =
    useState<SerializedMDXSource>(initialMdxSource);

  const [savedContent, setSavedContent] = useState(content);
  const [currentHash, setCurrentHash] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const requestIdRef = useRef(0);
  const savingRef = useRef(false);

  const snapshot = useDocumentSnapshot();

  useEffect(() => {
    const controller = new AbortController();

    function updateCurrentHash() {
      setCurrentHash(window.location.hash);
    }

    updateCurrentHash();

    window.addEventListener("hashchange", updateCurrentHash, {
      signal: controller.signal,
    });

    window.addEventListener("popstate", updateCurrentHash, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (snapshot.hash === window.location.hash) {
      setCurrentHash(snapshot.hash);
    }
  }, [snapshot.hash]);

  const hasDocumentHash = currentHash.startsWith("#doc=");

  const source =
    hasDocumentHash && snapshot.hash === currentHash ? snapshot.source : null;

  const hasChanges = source !== null && source !== (savedContent ?? "");

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (source === null) {
      return;
    }

    if (source === (content ?? "")) {
      setMdxSource(initialMdxSource);
      return;
    }

    const timeout = window.setTimeout(() => {
      void (async () => {
        const scope: MDXRecord = {
          banner_image,
          description,
          id,
          level,
          published_at,
          tags,
          title,
        };

        try {
          const result = await serializeMDXAction(source, scope);

          if (requestId !== requestIdRef.current) {
            return;
          }

          setMdxSource(result);
        } catch (error) {
          if (requestId !== requestIdRef.current) {
            return;
          }

          toast.error("Failed to serialize live MDX");
          console.error("Failed to serialize live MDX:", error);
        }
      })();
    }, 100);

    return () => {
      window.clearTimeout(timeout);

      if (requestIdRef.current === requestId) {
        ++requestIdRef.current;
      }
    };
  }, [
    source,
    content,
    initialMdxSource,
    banner_image,
    description,
    id,
    level,
    published_at,
    tags,
    title,
  ]);

  async function handleSave() {
    if (
      source === null ||
      !hasChanges ||
      savingRef.current ||
      window.location.hash !== snapshot.hash
    ) {
      toast.info(`No changes to update the ${isDraft ? "draft" : "post"}`);
      return;
    }

    const submittedContent = source;

    savingRef.current = true;
    setIsSaving(true);

    try {
      const updateContent = isDraft ? updateDraftContent : updatePostContent;

      const result = await updateContent(id, submittedContent);

      if (!result.success) {
        toast.error(
          isDraft ? "Failed to update draft" : "Failed to update post",
          {
            description: result.error,
          },
        );

        return;
      }

      if (result.data.content) setSavedContent(result.data.content);
      toast.success(isDraft ? "Draft content updated" : "Post content updated");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.";

      toast.error("Failed to save content", {
        description: message,
        duration: 5000,
      });
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  useKeyboardShortcut(["Control", "s"], handleSave, {
    allowInEditable: true,
    preventDefault: true,
    stopImmediatePropagation: true,
    stopPropagation: true,
  });

  return (
    <>
      {hasChanges && (
        <Button
          type="button"
          size="lg"
          className="shrink-0 absolute left-3 top-3"
          disabled={!hasChanges || isSaving}
          variant="success"
          onClick={handleSave}
        >
          {isSaving ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : (
            <SaveIcon className="size-4" />
          )}

          {isSaving ? "Saving…" : isDraft ? "Save Changes" : "Save Changes"}
        </Button>
      )}

      <div className="space-y-6 relative">
        {isSerializedMDXWithError(mdxSource) ? (
          <ArticleErrorModal {...mdxSource.error} />
        ) : (
          <article className="relative px-8 leading-snug tracking-tight text-blog-muted">
            <MDXClient
              compiledSource={mdxSource.compiledSource}
              frontmatter={mdxSource.frontmatter}
              scope={mdxSource.scope}
              components={MDXComponents}
            />
          </article>
        )}
      </div>
    </>
  );
}
