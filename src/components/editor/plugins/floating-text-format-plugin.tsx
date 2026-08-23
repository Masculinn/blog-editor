import { $isCodeHighlightNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  type LexicalEditor,
  type RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  LinkIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import {
  type Dispatch,
  type JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { getSelectedNode } from "@/components/get-selected-node";
import { setFloatingElemPosition } from "@/components/set-floating-elem-position";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * A RangeSelection may briefly outlive the TextNode/ElementNode it referenced
 * while Lexical reconciles a structural change such as inserting a decorator
 * node (horizontal rule, image, etc.).
 *
 * Never call getSelectedNode(), getTextContent(), or point.getNode() until
 * both points have been verified.
 */
function $isValidRangeSelection(selection: RangeSelection): boolean {
  const points = [selection.anchor, selection.focus];

  for (const point of points) {
    if (point.offset < 0) {
      return false;
    }

    const node = $getNodeByKey(point.key);

    if (node === null || !node.isAttached()) {
      return false;
    }

    if (point.type === "text") {
      if (!$isTextNode(node)) {
        return false;
      }

      if (point.offset > node.getTextContentSize()) {
        return false;
      }

      continue;
    }

    if (!$isElementNode(node)) {
      return false;
    }

    if (point.offset > node.getChildrenSize()) {
      return false;
    }
  }

  return true;
}

function TextFormatFloatingToolbar({
  editor,
  anchorElem,
  isLink,
  isBold,
  isItalic,
  isUnderline,
  isCode,
  isStrikethrough,
  setIsLinkEditMode,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  isBold: boolean;
  isCode: boolean;
  isItalic: boolean;
  isLink: boolean;
  isStrikethrough: boolean;
  isUnderline: boolean;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const insertLink = useCallback(() => {
    if (isLink) {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    setIsLinkEditMode(true);
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
  }, [editor, isLink, setIsLinkEditMode]);

  const updatePosition = useCallback(() => {
    const toolbar = toolbarRef.current;
    const rootElement = editor.getRootElement();

    if (toolbar === null || rootElement === null) {
      return;
    }

    const nativeSelection = rootElement.ownerDocument.getSelection();

    if (
      nativeSelection === null ||
      nativeSelection.isCollapsed ||
      nativeSelection.rangeCount === 0
    ) {
      return;
    }

    const range = nativeSelection.getRangeAt(0);

    if (
      !rootElement.contains(range.startContainer) ||
      !rootElement.contains(range.endContainer)
    ) {
      return;
    }

    const rect = range.getBoundingClientRect();

    setFloatingElemPosition(rect, toolbar, anchorElem, isLink);
  }, [editor, anchorElem, isLink]);

  useEffect(() => {
    const toolbar = toolbarRef.current;

    if (toolbar === null) {
      return;
    }

    const mouseMoveListener = (event: MouseEvent) => {
      const popup = toolbarRef.current;

      if (
        popup === null ||
        (event.buttons !== 1 && event.buttons !== 3) ||
        popup.style.pointerEvents === "none"
      ) {
        return;
      }

      const elementUnderMouse = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );

      if (elementUnderMouse === null || !popup.contains(elementUnderMouse)) {
        popup.style.pointerEvents = "none";
      }
    };

    const mouseUpListener = () => {
      const popup = toolbarRef.current;

      if (popup !== null && popup.style.pointerEvents !== "auto") {
        popup.style.pointerEvents = "auto";
      }
    };

    document.addEventListener("mousemove", mouseMoveListener);
    document.addEventListener("mouseup", mouseUpListener);

    return () => {
      document.removeEventListener("mousemove", mouseMoveListener);
      document.removeEventListener("mouseup", mouseUpListener);
    };
  }, []);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      updatePosition();
    };

    window.addEventListener("resize", update);

    scrollerElem?.addEventListener("scroll", update);

    return () => {
      window.removeEventListener("resize", update);

      scrollerElem?.removeEventListener("scroll", update);
    };
  }, [anchorElem, updatePosition]);

  useEffect(() => {
    updatePosition();

    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePosition();
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updatePosition();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, updatePosition]);

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      onMouseDown={(event) => {
        // Keep the editor selection alive while clicking toolbar controls.
        event.preventDefault();
      }}
      className="bg-popover text-popover-foreground absolute top-0 left-0 flex gap-1 rounded-md border p-1 opacity-0 shadow-md transition-opacity duration-300 will-change-transform"
    >
      {editor.isEditable() && (
        <ToggleGroup
          value={[
            isBold ? "bold" : "",
            isItalic ? "italic" : "",
            isUnderline ? "underline" : "",
            isStrikethrough ? "strikethrough" : "",
            isCode ? "code" : "",
            isLink ? "link" : "",
          ]}
        >
          <ToggleGroupItem
            value="bold"
            aria-label="Toggle bold"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            size="sm"
          >
            <BoldIcon className="size-4" />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="italic"
            aria-label="Toggle italic"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            size="sm"
          >
            <ItalicIcon className="size-4" />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="underline"
            aria-label="Toggle underline"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            size="sm"
          >
            <UnderlineIcon className="size-4" />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="strikethrough"
            aria-label="Toggle strikethrough"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            size="sm"
          >
            <StrikethroughIcon className="size-4" />
          </ToggleGroupItem>

          <Separator orientation="vertical" />

          <ToggleGroupItem
            value="code"
            aria-label="Toggle code"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            size="sm"
          >
            <CodeIcon className="size-4" />
          </ToggleGroupItem>

          <ToggleGroupItem
            value="link"
            aria-label="Toggle link"
            onClick={insertLink}
            size="sm"
          >
            <LinkIcon className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLDivElement | null,
  setIsLinkEditMode: Dispatch<boolean>,
): JSX.Element | null {
  const [isText, setIsText] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const $updatePopup = useCallback(() => {
    if (editor.isComposing()) {
      setIsText(false);
      return;
    }

    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      setIsText(false);
      return;
    }

    /**
     * This is the important guard.
     *
     * A stale selection containing offset -1 must be ignored before anything
     * tries to resolve its TextNode.
     */
    if (!$isValidRangeSelection(selection)) {
      setIsText(false);
      return;
    }

    if (selection.isCollapsed()) {
      setIsText(false);
      return;
    }

    const rootElement = editor.getRootElement();

    if (rootElement === null) {
      setIsText(false);
      return;
    }

    const nativeSelection = rootElement.ownerDocument.getSelection();

    if (
      nativeSelection === null ||
      nativeSelection.isCollapsed ||
      nativeSelection.rangeCount === 0
    ) {
      setIsText(false);
      return;
    }

    const nativeRange = nativeSelection.getRangeAt(0);

    if (
      !rootElement.contains(nativeRange.startContainer) ||
      !rootElement.contains(nativeRange.endContainer)
    ) {
      setIsText(false);
      return;
    }

    /*
     * Everything below this point is now allowed to consume the selection.
     */
    const node = getSelectedNode(selection);
    const textContent = selection.getTextContent().replace(/\n/g, "");

    if (textContent === "") {
      setIsText(false);
      return;
    }

    const anchorNode = $getNodeByKey(selection.anchor.key);

    if (anchorNode === null) {
      setIsText(false);
      return;
    }

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsStrikethrough(selection.hasFormat("strikethrough"));
    setIsCode(selection.hasFormat("code"));

    const parent = node.getParent();

    setIsLink($isLinkNode(node) || $isLinkNode(parent));

    setIsText(
      !$isCodeHighlightNode(anchorNode) &&
        ($isTextNode(node) || $isParagraphNode(node)),
    );
  }, [editor]);

  useEffect(() => {
    const update = () => {
      editor.read("latest", () => {
        $updatePopup();
      });
    };

    update();

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updatePopup();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updatePopup();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerRootListener((rootElement) => {
        if (rootElement === null) {
          setIsText(false);
        }
      }),
    );
  }, [editor, $updatePopup]);

  if (!isText || anchorElem === null) {
    return null;
  }

  return createPortal(
    <TextFormatFloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      isBold={isBold}
      isItalic={isItalic}
      isUnderline={isUnderline}
      isStrikethrough={isStrikethrough}
      isCode={isCode}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem,
  );
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem,
  setIsLinkEditMode,
}: {
  anchorElem: HTMLDivElement | null;
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  return useFloatingTextFormatToolbar(editor, anchorElem, setIsLinkEditMode);
}
