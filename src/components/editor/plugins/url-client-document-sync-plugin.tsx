"use client";

import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { docFromHash, docToHash } from "@/lib/serialization";
import { publishDocumentSnapshot } from "@/store/document.store";
import {
  editorStateFromSerializedDocument,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  type Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { VariantProps } from "class-variance-authority";
import {
  CLEAR_HISTORY_COMMAND,
  SKIP_SCROLL_INTO_VIEW_TAG,
  SKIP_SELECTION_FOCUS_TAG,
  type EditorState,
} from "lexical";
import { CheckCheckIcon, ShieldAlertIcon } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type UrlClientDocumentSyncPluginProps = {
  initialMarkdown?: string | null;
  transformers: Transformer[];
  shouldPreserveNewLinesInMarkdown?: boolean;
  debounceMs?: number;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
};

type SyncStatus = "loading" | "syncing" | "synced" | "error";

type EditorDocumentSnapshot = {
  hash: string;
  source: string;
};

const STATUS_CONFIG = {
  loading: {
    Component: <Spinner className="size-3" />,
    variant: "primary",
  },
  error: {
    Component: <ShieldAlertIcon className="size-3" />,
    variant: "destructive",
  },
  synced: {
    Component: <CheckCheckIcon className="size-3" />,
    variant: "success",
  },
  syncing: {
    Component: <Spinner className="size-3" />,
    variant: "primary",
  },
} as const satisfies {
  [key in SyncStatus]: {
    Component: React.ReactNode;
    variant: VariantProps<typeof badgeVariants>["variant"];
  };
};

const URL_DOCUMENT_SYNC_TAG = "url-document-sync";

const DEFAULT_DEBOUNCE_MS = 5_000;

const CODE_LANGUAGE_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  tsx: "ts",
  jsx: "js",
};

function normalizeExternalMarkdown(markdown: string): string {
  const normalizedLineEndings = markdown
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u2028|\u2029/g, "\n");

  const lines = normalizedLineEndings.split("\n");

  let activeFenceLength: number | null = null;

  return lines
    .map((line) => {
      if (activeFenceLength !== null) {
        const closingMatch = line.match(/^([ \t]*)(`{3,})[ \t]*$/);

        if (closingMatch && closingMatch[2].length >= activeFenceLength) {
          activeFenceLength = null;

          return `${closingMatch[1]}${closingMatch[2]}`;
        }

        return line;
      }

      const openingMatch = line.match(/^([ \t]*)(`{3,})[ \t]*([\w-]+)?[ \t]*$/);

      if (!openingMatch) {
        return line;
      }

      const [, indentation, fence, rawLanguage] = openingMatch;

      activeFenceLength = fence.length;

      if (!rawLanguage) {
        return `${indentation}${fence}`;
      }

      const normalizedLanguage =
        CODE_LANGUAGE_ALIASES[rawLanguage.toLowerCase()] ?? rawLanguage;

      return `${indentation}${fence}${normalizedLanguage}`;
    })
    .join("\n");
}

function editorStateToMarkdown(
  editorState: EditorState,
  transformers: Transformer[],
  shouldPreserveNewLinesInMarkdown: boolean,
): string {
  return editorState.read(() =>
    $convertToMarkdownString(
      transformers,
      undefined,
      shouldPreserveNewLinesInMarkdown,
    ),
  );
}

async function createDocumentSnapshot(
  editorState: EditorState,
  transformers: Transformer[],
  shouldPreserveNewLinesInMarkdown: boolean,
): Promise<EditorDocumentSnapshot> {
  const document = serializedDocumentFromEditorState(editorState, {
    source: "editor",
  });

  const source = editorStateToMarkdown(
    editorState,
    transformers,
    shouldPreserveNewLinesInMarkdown,
  );

  const hash = await docToHash(document);

  return {
    hash,
    source,
  };
}

export function UrlClientDocumentSyncPlugin({
  initialMarkdown,
  transformers,
  shouldPreserveNewLinesInMarkdown = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  scrollContainerRef,
}: UrlClientDocumentSyncPluginProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("loading");

  const initializedRef = useRef(false);
  const hashBootstrappedRef = useRef(false);
  const hydrationIdRef = useRef(0);
  const writeIdRef = useRef(0);

  const scrollFrameRef = useRef<number | null>(null);

  const [editor] = useLexicalComposerContext();

  const resetScrollToTop = useCallback(() => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null;

      scrollContainerRef?.current?.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  }, [scrollContainerRef]);

  const commitEditorState = useCallback(
    async (editorState: EditorState) => {
      const writeId = ++writeIdRef.current;

      try {
        const snapshot = await createDocumentSnapshot(
          editorState,
          transformers,
          shouldPreserveNewLinesInMarkdown,
        );

        if (writeId !== writeIdRef.current) {
          return;
        }

        const url =
          window.location.pathname + window.location.search + snapshot.hash;

        window.history.replaceState(window.history.state, "", url);

        publishDocumentSnapshot(snapshot);

        setSyncStatus("synced");
      } catch {
        if (writeId !== writeIdRef.current) {
          return;
        }

        setSyncStatus("error");
      }
    },
    [transformers, shouldPreserveNewLinesInMarkdown],
  );

  const writeSnapshot = useDebounce((editorState: EditorState) => {
    void commitEditorState(editorState);
  }, debounceMs);

  useEffect(() => {
    let disposed = false;

    const hydrationId = ++hydrationIdRef.current;

    initializedRef.current = false;
    setSyncStatus("loading");
    writeSnapshot.cancel();

    ++writeIdRef.current;

    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }

    const unregister = editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, tags }) => {
        if (!initializedRef.current) {
          return;
        }

        if (tags.has(URL_DOCUMENT_SYNC_TAG)) {
          return;
        }

        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return;
        }

        setSyncStatus("syncing");

        writeSnapshot(editorState);
      },
    );

    async function initializeDocument() {
      try {
        if (typeof initialMarkdown === "string") {
          const normalizedMarkdown = normalizeExternalMarkdown(initialMarkdown);

          editor.update(
            () => {
              $convertFromMarkdownString(
                normalizedMarkdown,
                transformers,
                undefined,
                shouldPreserveNewLinesInMarkdown,
              );
            },
            {
              tag: [
                URL_DOCUMENT_SYNC_TAG,
                SKIP_SCROLL_INTO_VIEW_TAG,
                SKIP_SELECTION_FOCUS_TAG,
              ],
              discrete: true,

              onUpdate: () => {
                if (disposed || hydrationId !== hydrationIdRef.current) {
                  return;
                }

                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);

                initializedRef.current = true;

                resetScrollToTop();

                setSyncStatus("syncing");

                void commitEditorState(editor.getEditorState());
              },
            },
          );

          return;
        }

        if (!hashBootstrappedRef.current) {
          hashBootstrappedRef.current = true;

          const hash = window.location.hash;

          if (hash.startsWith("#doc=")) {
            const document = await docFromHash(hash);

            if (disposed || hydrationId !== hydrationIdRef.current) {
              return;
            }

            if (document?.source === "editor") {
              const nextEditorState = editorStateFromSerializedDocument(
                editor,
                document,
              );

              editor.setEditorState(nextEditorState, {
                tag: SKIP_SCROLL_INTO_VIEW_TAG,
              });

              editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);

              initializedRef.current = true;

              resetScrollToTop();

              const source = editorStateToMarkdown(
                nextEditorState,
                transformers,
                shouldPreserveNewLinesInMarkdown,
              );

              publishDocumentSnapshot({
                hash,
                source,
              });

              setSyncStatus("synced");

              return;
            }
          }
        }

        initializedRef.current = true;

        resetScrollToTop();

        setSyncStatus("synced");
      } catch {
        if (disposed || hydrationId !== hydrationIdRef.current) {
          return;
        }

        initializedRef.current = true;

        setSyncStatus("error");
      }
    }

    void initializeDocument();

    return () => {
      disposed = true;

      unregister();

      writeSnapshot.cancel();
      ++writeIdRef.current;

      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [
    editor,
    initialMarkdown,
    transformers,
    shouldPreserveNewLinesInMarkdown,
    writeSnapshot,
    commitEditorState,
    resetScrollToTop,
  ]);

  const { Component, variant } = STATUS_CONFIG[syncStatus];

  return (
    <Badge variant={variant} className="pointer-events-none">
      {Component}
      <span>{syncStatus}</span>
    </Badge>
  );
}
