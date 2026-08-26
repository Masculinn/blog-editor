// components/editor/plugins/picker/details-picker-plugin.tsx

import { $createParagraphNode, $createTextNode, $insertNodes } from "lexical";
import { ListCollapseIcon } from "lucide-react";

import { ComponentPickerOption } from "@/components/component-picker-option";
import { $createDetailsContainerNode } from "@/components/editor/nodes/details-container-node";
import { $createDetailsContentNode } from "@/components/editor/nodes/details-content-node";
import { $createDetailsSummaryNode } from "@/components/editor/nodes/details-summary-node";

export function DetailsPickerPlugin() {
  return new ComponentPickerOption("Details", {
    icon: <ListCollapseIcon className="size-4" />,
    keywords: ["details", "summary", "collapse", "accordion", "toggle"],

    onSelect: (_queryString, editor) => {
      editor.update(() => {
        const details = $createDetailsContainerNode(false);

        const summary = $createDetailsSummaryNode();
        summary.append($createTextNode("Summary"));

        const content = $createDetailsContentNode();

        const paragraph = $createParagraphNode();
        paragraph.append(
          $createTextNode("Write the expandable content here..."),
        );

        content.append(paragraph);

        details.append(summary, content);

        $insertNodes([details]);

        summary.selectEnd();
      });
    },
  });
}
