import { $wrapNodeInElement } from "@lexical/utils";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  defineExtension,
  type LexicalCommand,
  type LexicalEditor,
} from "lexical";
import { type JSX, useState } from "react";

import {
  $createImageNode,
  ImageNode,
  type ImagePayload,
} from "@/components/image-node";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

function InsertImageUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");

  const isDisabled = src.trim() === "";

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="image-url">Image URL</FieldLabel>

        <Input
          id="image-url"
          placeholder="https://example.com/image.jpg"
          onChange={(event) => setSrc(event.target.value)}
          value={src}
          data-test-id="image-modal-url-input"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="image-url-alt-text">Alt Text</FieldLabel>

        <Input
          id="image-url-alt-text"
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
          onClick={() =>
            onClick({
              altText,
              src: src.trim(),
            })
          }
          data-test-id="image-modal-confirm-btn"
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
  function onClick(payload: InsertImagePayload) {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onClose();
  }

  return <InsertImageUriDialogBody onClick={onClick} />;
}

export const ImagesExtension = defineExtension({
  name: "Images",

  nodes: [ImageNode],

  register: (editor) =>
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
});
