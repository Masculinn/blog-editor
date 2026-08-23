import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { isMimeType, mediaFileReader, mergeRegister } from "@lexical/utils";
import {
  $createRangeSelection,
  $getNearestNodeFromDOMNode,
  $getRoot,
  $isElementNode,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  defineExtension,
  DROP_COMMAND,
  type LexicalEditor,
} from "lexical";

import { INSERT_IMAGE_COMMAND } from "@/components/editor/extensions/images-extension";

const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
];

type DropPosition = {
  node: Node;
  offset: number;
};

function getImageFiles(event: DragEvent): File[] {
  const files = event.dataTransfer?.files;

  if (!files || files.length === 0) {
    return [];
  }

  return Array.from(files).filter((file) =>
    isMimeType(file, ACCEPTABLE_IMAGE_TYPES),
  );
}

function getDropPosition(
  event: DragEvent,
  editor: LexicalEditor,
): DropPosition | null {
  const rootElement = editor.getRootElement();

  if (!rootElement) {
    return null;
  }

  const position = rootElement.ownerDocument.caretPositionFromPoint(
    event.clientX,
    event.clientY,
  );

  if (!position) {
    return null;
  }

  return {
    node: position.offsetNode,
    offset: position.offset,
  };
}

function $setCollapsedElementSelection(key: string, offset: number) {
  const selection = $createRangeSelection();

  selection.anchor.set(key, offset, "element");
  selection.focus.set(key, offset, "element");

  $setSelection(selection);
}

function $setCollapsedTextSelection(key: string, offset: number) {
  const selection = $createRangeSelection();

  selection.anchor.set(key, offset, "text");
  selection.focus.set(key, offset, "text");

  $setSelection(selection);
}

function $selectEndOfRoot() {
  const root = $getRoot();

  $setCollapsedElementSelection(root.getKey(), root.getChildrenSize());
}

function $selectDropPoint(event: DragEvent, editor: LexicalEditor) {
  const position = getDropPosition(event, editor);

  if (!position) {
    $selectEndOfRoot();
    return;
  }

  const node = $getNearestNodeFromDOMNode(position.node);

  if (!node) {
    $selectEndOfRoot();
    return;
  }

  if ($isTextNode(node)) {
    const offset = Math.min(position.offset, node.getTextContentSize());

    $setCollapsedTextSelection(node.getKey(), offset);

    return;
  }

  if ($isElementNode(node)) {
    const offset = Math.min(position.offset, node.getChildrenSize());

    $setCollapsedElementSelection(node.getKey(), offset);

    return;
  }

  const parent = node.getParent();

  if (!parent) {
    $selectEndOfRoot();
    return;
  }

  $setCollapsedElementSelection(
    parent.getKey(),
    node.getIndexWithinParent() + 1,
  );
}

export const DragDropPasteExtension = defineExtension({
  name: "DragDropPaste",

  register: (editor) =>
    mergeRegister(
      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          const files = getImageFiles(event);

          if (files.length === 0) {
            return false;
          }

          event.preventDefault();

          $selectDropPoint(event, editor);

          editor.dispatchCommand(DRAG_DROP_PASTE, files);

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),

      editor.registerCommand(
        DRAG_DROP_PASTE,
        (files) => {
          const imageFiles = files.filter((file) =>
            isMimeType(file, ACCEPTABLE_IMAGE_TYPES),
          );

          if (imageFiles.length === 0) {
            return false;
          }

          void (async () => {
            const filesResult = await mediaFileReader(
              imageFiles,
              ACCEPTABLE_IMAGE_TYPES,
            );

            for (const { file, result } of filesResult) {
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                altText: file.name,
                src: result,
              });
            }
          })();

          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    ),
});
