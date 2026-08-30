"use client";

import { docFromHash, docToHash } from "@/components/doc-serialization";
import { useDebounce } from "@/components/use-debounce";
import {
  editorStateFromSerializedDocument,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import {
  $convertFromMarkdownString,
  type Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  CLEAR_HISTORY_COMMAND,
  SKIP_SCROLL_INTO_VIEW_TAG,
  SKIP_SELECTION_FOCUS_TAG,
  type EditorState,
} from "lexical";
import { useCallback, useEffect, useRef, type RefObject } from "react";

type UrlClientDocumentSyncPluginProps = {
  initialMarkdown?: string | null;
  transformers: Transformer[];
  shouldPreserveNewLinesInMarkdown?: boolean;
  debounceMs?: number;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
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

      if (!openingMatch) return line;

      const [, indentation, fence, rawLanguage] = openingMatch;

      activeFenceLength = fence.length;

      if (!rawLanguage) return `${indentation}${fence}`;

      const normalizedLanguage =
        CODE_LANGUAGE_ALIASES[rawLanguage.toLowerCase()] ?? rawLanguage;

      return `${indentation}${fence}${normalizedLanguage}`;
    })
    .join("\n");
}

export function UrlClientDocumentSyncPlugin({
  initialMarkdown,
  transformers,
  shouldPreserveNewLinesInMarkdown = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  scrollContainerRef,
}: UrlClientDocumentSyncPluginProps) {
  const [editor] = useLexicalComposerContext();

  const initializedRef = useRef(false);
  const hashBootstrappedRef = useRef(false);
  const hydrationIdRef = useRef(0);
  const writeIdRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

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

  const writeHash = useDebounce((editorState: EditorState) => {
    const writeId = ++writeIdRef.current;
    void (async () => {
      const document = serializedDocumentFromEditorState(editorState, {
        source: "editor",
      });
      const hash = await docToHash(document);
      if (writeId !== writeIdRef.current) return;
      const url = window.location.pathname + window.location.search + hash;
      window.history.replaceState(window.history.state, "", url);
    })();
  }, debounceMs);

  useEffect(() => {
    let disposed = false;
    const hydrationId = ++hydrationIdRef.current;

    initializedRef.current = false;
    writeHash.cancel();
    ++writeIdRef.current;

    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }

    const unregister = editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves, tags }) => {
        if (!initializedRef.current) return;
        if (tags.has(URL_DOCUMENT_SYNC_TAG)) return;
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
        writeHash(editorState);
      },
    );

    async function initializeDocument() {
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
              if (disposed || hydrationId !== hydrationIdRef.current) return;
              editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
              initializedRef.current = true;
              resetScrollToTop();
              writeHash(editor.getEditorState());
              writeHash.flush();
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
          if (disposed || hydrationId !== hydrationIdRef.current) return;
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
            return;
          }
        }
      }
      initializedRef.current = true;
      resetScrollToTop();
    }
    void initializeDocument();
    return () => {
      disposed = true;
      unregister();
      writeHash.cancel();
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
    writeHash,
    resetScrollToTop,
  ]);
  return null;
}
