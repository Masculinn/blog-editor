import { ComponentPickerOption } from "@/components/component-picker-option";
import { ChartBarIcon } from "lucide-react";
import { InsertChartDialog } from "../../chart/chart-dialog";

export function ChartPickerPlugin() {
  return new ComponentPickerOption("Chart", {
    icon: <ChartBarIcon className="size-4" />,
    keywords: ["bar", "graph", "chart", "statistics", "data"],
    onSelect: (_, editor, showModal) =>
      showModal("Insert Chart ", (onClose) => (
        <InsertChartDialog activeEditor={editor} onClose={onClose} />
      )),
  });
}
