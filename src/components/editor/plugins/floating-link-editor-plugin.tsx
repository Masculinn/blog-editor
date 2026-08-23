import {
  $createLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  type BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Check, Pencil, Trash, X } from "lucide-react";
import {
  type Dispatch,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
  type SetStateAction,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { getSelectedNode } from "@/components/get-selected-node";
import { setFloatingElemPositionForLinkEditor } from "@/components/set-floating-elem-position-for-link-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sanitizeUrl } from "@/utils/editor/validateUrl";

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<SetStateAction<boolean>>;
  anchorElem: HTMLElement;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // This value does not affect rendering, so it belongs in a ref rather
  // than React state. This avoids a render whenever Lexical's selection changes.
  const lastSelectionRef = useRef<BaseSelection | null>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [editedLinkUrl, setEditedLinkUrl] = useState("https://");

  /**
   * This logic is invoked by subscriptions installed inside Effects.
   *
   * useEffectEvent lets it always see the latest props/state without forcing
   * those subscriptions to unregister and register again whenever, for example,
   * isLinkEditMode changes.
   */
  const $updateLinkEditor = useEffectEvent(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);

      let nextLinkUrl = "";

      if (linkParent) {
        nextLinkUrl = linkParent.getURL();
      } else if ($isLinkNode(node)) {
        nextLinkUrl = node.getURL();
      }

      setLinkUrl(nextLinkUrl);

      // Use the URL calculated during this read instead of the linkUrl
      // React state from a previous render.
      if (isLinkEditMode) {
        setEditedLinkUrl(nextLinkUrl);
      }
    }

    const editorElem = editorRef.current;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    const floatingEditorHasFocus =
      activeElement !== null && editorElem.contains(activeElement);

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRect =
        nativeSelection.focusNode?.parentElement?.getBoundingClientRect();

      if (domRect) {
        domRect.y += 40;

        setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
      }

      lastSelectionRef.current = selection;
      return;
    }

    // Do not close the floating editor merely because focus moved from
    // Lexical into its URL input/buttons.
    if (!floatingEditorHasFocus) {
      if (rootElement !== null) {
        setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
      }

      lastSelectionRef.current = null;
      setIsLinkEditMode(false);
      setLinkUrl("");
    }
  });

  /**
   * The Escape command must read the current isLink value, but changing
   * isLink should not require re-registering the Lexical command.
   */
  const handleEscapeCommand = useEffectEvent(() => {
    if (!isLink) {
      return false;
    }

    setIsLink(false);
    setIsLinkEditMode(false);

    return true;
  });

  /**
   * Keep positioning synchronized with viewport/scroller movement.
   *
   * anchorElem itself is the dependency. anchorElem.parentElement is not a
   * reactive value and should not be placed directly in the dependency array.
   */
  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    function update() {
      editor.getEditorState().read(() => {
        $updateLinkEditor();
      });
    }

    window.addEventListener("resize", update);

    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);

      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem, editor]);

  /**
   * Lexical subscriptions only need to be recreated if the editor instance
   * itself changes.
   */
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => handleEscapeCommand(),
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  /**
   * Initialize the floating editor against the current editor state.
   */
  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateLinkEditor();
    });
  }, [editor]);

  /**
   * This Effect has one job: synchronize edit mode with DOM focus.
   */
  useEffect(() => {
    if (isLinkEditMode) {
      inputRef.current?.focus();
    }
  }, [isLinkEditMode]);

  function handleLinkSubmission() {
    if (lastSelectionRef.current === null) {
      return;
    }

    if (linkUrl !== "") {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));

      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return;
        }

        const parent = getSelectedNode(selection).getParent();

        if (!$isAutoLinkNode(parent)) {
          return;
        }

        const linkNode = $createLinkNode(parent.getURL(), {
          rel: parent.__rel,
          target: parent.__target,
          title: parent.__title,
        });

        parent.replace(linkNode, true);
      });
    }

    setEditedLinkUrl("https://");
    setIsLinkEditMode(false);
  }

  function monitorInputInteraction(
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLinkSubmission();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsLinkEditMode(false);
    }
  }

  return (
    <div
      ref={editorRef}
      className="absolute top-0 left-0 w-full max-w-sm opacity-0"
    >
      {!isLink ? null : isLinkEditMode ? (
        <div className="bg-popover text-popover-foreground flex items-center gap-2 rounded-md border p-1 pl-2 shadow-md">
          <Input
            ref={inputRef}
            value={editedLinkUrl}
            onChange={(event) => {
              setEditedLinkUrl(event.target.value);
            }}
            onKeyDown={monitorInputInteraction}
            className="h-8 flex-grow"
          />

          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              setIsLinkEditMode(false);
              setIsLink(false);
            }}
            className="shrink-0"
            aria-label="Cancel"
          >
            <X />
          </Button>

          <Button
            size="icon-sm"
            onClick={handleLinkSubmission}
            className="shrink-0"
            aria-label="Confirm link"
          >
            <Check />
          </Button>
        </div>
      ) : (
        <div className="bg-popover text-popover-foreground flex items-center justify-between gap-2 rounded-md border p-1 pl-2 shadow-md">
          <a
            href={sanitizeUrl(linkUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary truncate text-sm underline-offset-4 hover:underline"
          >
            {linkUrl}
          </a>

          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                setEditedLinkUrl(linkUrl);
                setIsLinkEditMode(true);
              }}
              aria-label="Edit link"
            >
              <Pencil />
            </Button>

            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              }}
              className="text-destructive hover:text-destructive"
              aria-label="Remove link"
            >
              <Trash />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  isLinkEditMode: boolean,
  setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  useEffect(() => {
    function $updateToolbar() {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = getSelectedNode(selection);
        const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
        const focusAutoLinkNode = $findMatchingParent(
          focusNode,
          $isAutoLinkNode,
        );
        if (!(focusLinkNode || focusAutoLinkNode)) {
          setIsLink(false);
          return;
        }
        const badNode = selection
          .getNodes()
          .filter((node) => !$isLineBreakNode(node))
          .find((node) => {
            const linkNode = $findMatchingParent(node, $isLinkNode);
            const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
            return (
              (focusLinkNode && !focusLinkNode.is(linkNode)) ||
              (linkNode && !linkNode.is(focusLinkNode)) ||
              (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
              (autoLinkNode &&
                (!autoLinkNode.is(focusAutoLinkNode) ||
                  autoLinkNode.getIsUnlinked()))
            );
          });
        if (!badNode) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      } else if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length === 0) {
          setIsLink(false);
          return;
        }
        const node = nodes[0];
        const parent = node.getParent();
        if ($isLinkNode(parent) || $isLinkNode(node)) {
          setIsLink(true);
        } else {
          setIsLink(false);
        }
      }
    }
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          $updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkNode = $findMatchingParent(node, $isLinkNode);
            if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
              window.open(linkNode.getURL(), "_blank");
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  if (!anchorElem) {
    return null;
  }

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      isLink={isLink}
      anchorElem={anchorElem}
      setIsLink={setIsLink}
      isLinkEditMode={isLinkEditMode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem,
  );
}

export function FloatingLinkEditorPlugin({
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElem: HTMLDivElement | null;
  isLinkEditMode: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  return useFloatingLinkEditorToolbar(
    editor,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
  );
}
