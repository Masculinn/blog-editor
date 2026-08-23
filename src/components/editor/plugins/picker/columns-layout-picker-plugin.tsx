import { Columns3Icon } from "lucide-react";
import { ComponentPickerOption } from "@/components/component-picker-option";
import { InsertLayoutDialog } from "@/components/editor/plugins/layout-plugin";

export function ColumnsLayoutPickerPlugin() {
  return new ComponentPickerOption("Columns Layout", {
    icon: <Columns3Icon className="size-4" />,
    keywords: ["columns", "layout", "grid"],
    onSelect: (_, editor, showModal) =>
      showModal("Insert Columns Layout", (onClose) => (
        <InsertLayoutDialog activeEditor={editor} onClose={onClose} />
      )),
  });
}
