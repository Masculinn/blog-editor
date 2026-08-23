import {
  $isAutoLinkNode,
  $isLinkNode,
  type LinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $createRangeSelection,
  $findMatchingParent,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  defineExtension,
  getDOMSelectionFromTarget,
  isHTMLElement,
  type LexicalCommand,
  type LexicalEditor,
} from "lexical";
import { type JSX, useEffect, useState } from "react";

import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  type ImagePayload,
} from "@/components/image-node";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

export function InsertImageUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");

  const isDisabled = src === "";

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="image-url">Image URL</FieldLabel>
        <Input
          id="image-url"
          placeholder="i.e. https://source.unsplash.com/random"
          onChange={(event) => setSrc(event.target.value)}
          value={src}
          data-test-id="image-modal-url-input"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="image-url-alt-text">Alt Text</FieldLabel>
        <Input
          id="image-url-alt-text"
          placeholder="Random unsplash image"
          onChange={(event) => setAltText(event.target.value)}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />
      </Field>

      <DialogFooter>
        <Button
          type="submit"
          disabled={isDisabled}
          onClick={() => onClick({ altText, src })}
          data-test-id="image-modal-confirm-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </FieldGroup>
  );
}

export function InsertImageUploadedDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");

  const isDisabled = src === "";

  const loadImage = (files: FileList | null) => {
    const file = files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSrc(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="image-upload">Image Upload</FieldLabel>
        <Input
          id="image-upload"
          type="file"
          onChange={(event) => loadImage(event.target.files)}
          accept="image/*"
          data-test-id="image-modal-file-upload"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="image-upload-alt-text">Alt Text</FieldLabel>
        <Input
          id="image-upload-alt-text"
          placeholder="Descriptive alternative text"
          onChange={(event) => setAltText(event.target.value)}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />
      </Field>

      <DialogFooter>
        <Button
          type="submit"
          disabled={isDisabled}
          onClick={() => onClick({ altText, src })}
          data-test-id="image-modal-file-upload-btn"
        >
          Confirm
        </Button>
      </DialogFooter>
    </FieldGroup>
  );
}

export function InsertImageDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  useEffect(() => {
    const handler = (_event: KeyboardEvent) => {};

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onClose();
  };

  return (
    <Tabs defaultValue="url">
      <TabsList className="w-full">
        <TabsTrigger value="url">URL</TabsTrigger>
        <TabsTrigger value="file">File</TabsTrigger>
      </TabsList>

      <TabsContent value="url">
        <InsertImageUriDialogBody onClick={onClick} />
      </TabsContent>

      <TabsContent value="file">
        <InsertImageUploadedDialogBody onClick={onClick} />
      </TabsContent>
    </Tabs>
  );
}

export const ImagesExtension = defineExtension({
  name: "@shadcn-editor/Images",
  nodes: [ImageNode],

  register: (editor) =>
    mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);

          $insertNodes([imageNode]);

          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),

      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        $onDragStart,
        COMMAND_PRIORITY_HIGH,
      ),

      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        $onDragOver,
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => $onDrop(event, editor),
        COMMAND_PRIORITY_HIGH,
      ),
    ),
});

const TRANSPARENT_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

let transparentDragImage: HTMLImageElement | null = null;

function getTransparentDragImage(): HTMLImageElement {
  if (transparentDragImage === null) {
    transparentDragImage = document.createElement("img");
    transparentDragImage.src = TRANSPARENT_IMAGE;
  }

  return transparentDragImage;
}

function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();

  if (!node) {
    return false;
  }

  const dataTransfer = event.dataTransfer;

  if (!dataTransfer) {
    return false;
  }

  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(getTransparentDragImage(), 0, 0);
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    }),
  );

  return true;
}

function $onDragOver(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();

  if (!node) {
    return false;
  }

  if (!canDropImage(event)) {
    event.preventDefault();
  }

  return false;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection();

  if (!node) {
    return false;
  }

  const data = getDragImageData(event);

  if (!data) {
    return false;
  }

  const existingLink = $findMatchingParent(
    node,
    (parent): parent is LinkNode =>
      !$isAutoLinkNode(parent) && $isLinkNode(parent),
  );

  event.preventDefault();

  if (!canDropImage(event)) {
    return true;
  }

  const range = getDragSelection(event);

  node.remove();

  const rangeSelection = $createRangeSelection();

  if (range != null) {
    rangeSelection.applyDOMRange(range);
  }

  $setSelection(rangeSelection);

  editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);

  if (existingLink) {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, existingLink.getURL());
  }

  return true;
}

function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();

  if (!$isNodeSelection(selection)) {
    return null;
  }

  const [node] = selection.getNodes();

  return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): InsertImagePayload | null {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");

  if (!dragData) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(dragData);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("type" in parsed) ||
      !("data" in parsed) ||
      parsed.type !== "image"
    ) {
      return null;
    }

    return parsed.data as InsertImagePayload;
  } catch {
    return null;
  }
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;

  return Boolean(
    isHTMLElement(target) &&
      !target.closest("code, span.editor-image") &&
      isHTMLElement(target.parentElement) &&
      target.parentElement.closest("div.ContentEditable__root"),
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  const domSelection = getDOMSelectionFromTarget(event.target);

  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(event.clientX, event.clientY);
  }

  if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset ?? 0);

    return domSelection.getRangeAt(0);
  }

  throw new Error("Cannot get the selection when dragging");
}
