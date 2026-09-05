import { ComponentPickerOption } from "@/components/component-picker-option";
import { ListTreeIcon } from "lucide-react";

import { InsertContentsDialog } from "./contents-dialog";
import { $getContentsInsertionKey } from "./contents-editor";

export function ContentsPickerPlugin() {
  return new ComponentPickerOption("Contents", {
    icon: <ListTreeIcon className="size-4" />,
    keywords: [
      "contents",
      "toc",
      "table of contents",
      "navigation",
      "sections",
    ],
    onSelect: (_, editor, showModal) => {
      editor.update(() => {
        const insertionKey = $getContentsInsertionKey();

        showModal("Insert Table of Contents", (onClose) => (
          <InsertContentsDialog
            activeEditor={editor}
            insertionKey={insertionKey}
            onClose={onClose}
          />
        ));
      });
    },
  });
}
