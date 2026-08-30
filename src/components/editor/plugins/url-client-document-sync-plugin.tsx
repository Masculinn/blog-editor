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
import { CLEAR_HISTORY_COMMAND, type EditorState } from "lexical";
import { useEffect, useRef } from "react";

const URL_DOCUMENT_SYNC_TAG = "url-document-sync";
const DEFAULT_DEBOUNCE_MS = 5_000;

/**
 * Normalize shorthand fenced-code language identifiers coming from
 * external Markdown sources.
 *
 * ```ts  -> ```typescript
 * ```js  -> ```javascript
 *
 * Also supports whitespace between the fence and language:
 *
 * ``` ts -> ``` typescript
 * ``` js -> ``` javascript
 *
 * Only opening fenced-code declarations are modified.
 * Code contents remain untouched.
 */
function normalizeMarkdownCodeLanguages(markdown: string): string {
  return markdown.replace(
    /^(`{3,})([ \t]*)(ts|js)(?=[ \t]*$|[ \t])/gim,
    (_, fence: string, whitespace: string, language: string) => {
      const normalizedLanguage =
        language.toLowerCase() === "ts" ? "typescript" : "javascript";

      return `${fence}${whitespace}${normalizedLanguage}`;
    },
  );
}

type UrlClientDocumentSyncPluginProps = {
  initialMarkdown?: string | null;
  transformers: Transformer[];
  shouldPreserveNewLinesInMarkdown?: boolean;
  debounceMs?: number;
};

export function UrlClientDocumentSyncPlugin({
  initialMarkdown,
  transformers,
  shouldPreserveNewLinesInMarkdown = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UrlClientDocumentSyncPluginProps) {
  const [editor] = useLexicalComposerContext();

  const initializedRef = useRef(false);
  const bootstrappedRef = useRef(false);
  const hydrationIdRef = useRef(0);
  const writeIdRef = useRef(0);

  const writeHash = useDebounce((editorState: EditorState) => {
    const writeId = ++writeIdRef.current;

    void (async () => {
      const document = serializedDocumentFromEditorState(editorState, {
        source: "editor",
      });

      const hash = await docToHash(document);

      if (writeId !== writeIdRef.current) {
        return;
      }

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

        writeHash(editorState);
      },
    );

    async function initializeDocument() {
      if (!bootstrappedRef.current) {
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
              tag: URL_DOCUMENT_SYNC_TAG,
            });

            editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);

            bootstrappedRef.current = true;
            initializedRef.current = true;

            return;
          }
        }
      }

      if (typeof initialMarkdown === "string") {
        const normalizedMarkdown =
          normalizeMarkdownCodeLanguages(initialMarkdown);

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
            tag: URL_DOCUMENT_SYNC_TAG,
            discrete: true,

            onUpdate: () => {
              if (disposed || hydrationId !== hydrationIdRef.current) {
                return;
              }

              editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);

              bootstrappedRef.current = true;
              initializedRef.current = true;

              writeHash(editor.getEditorState());
              writeHash.flush();
            },
          },
        );

        return;
      }

      bootstrappedRef.current = true;
      initializedRef.current = true;
    }

    void initializeDocument();

    return () => {
      disposed = true;

      unregister();
      writeHash.cancel();

      ++writeIdRef.current;
    };
  }, [
    editor,
    initialMarkdown,
    transformers,
    shouldPreserveNewLinesInMarkdown,
    writeHash,
  ]);

  return null;
}
