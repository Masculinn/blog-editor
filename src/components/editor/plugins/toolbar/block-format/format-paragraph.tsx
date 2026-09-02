import { useToolbarContext } from "@/components/toolbar-context";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { blockTypeToBlockName } from "@/constants/blocks.data";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

const BLOCK_FORMAT_VALUE = "paragraph";

export function FormatParagraph() {
  const { activeEditor } = useToolbarContext();

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  return (
    <DropdownMenuItem onClick={formatParagraph}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE].icon}
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE].label}
      </div>
    </DropdownMenuItem>
  );
}
