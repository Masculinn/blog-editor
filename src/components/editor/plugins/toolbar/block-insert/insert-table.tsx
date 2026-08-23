import { TableIcon } from "lucide-react";
import { InsertTableDialog } from "@/components/table-plugin";
import { useToolbarContext } from "@/components/toolbar-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function InsertTable() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <DropdownMenuItem
      onClick={() =>
        showModal("Insert Table", (onClose) => (
          <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
        ))
      }
    >
      <div className="flex items-center gap-1">
        <TableIcon className="size-4" />
        <span>Table</span>
      </div>
    </DropdownMenuItem>
  );
}
