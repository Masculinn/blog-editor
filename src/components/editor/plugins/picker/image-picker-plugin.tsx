import { ImageIcon } from "lucide-react";
import { ComponentPickerOption } from "@/components/component-picker-option";
import { InsertImageDialog } from "@/components/editor/extensions/images-extension";

export function ImagePickerPlugin() {
  return new ComponentPickerOption("Image", {
    icon: <ImageIcon className="size-4" />,
    keywords: ["image", "photo", "picture", "file"],
    onSelect: (_, editor, showModal) =>
      showModal("Insert Image", (onClose) => (
        <InsertImageDialog activeEditor={editor} onClose={onClose} />
      )),
  });
}
