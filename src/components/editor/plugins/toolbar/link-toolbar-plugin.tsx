import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isRangeSelection, type BaseSelection } from "lexical";
import { LinkIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { getSelectedNode } from "@/components/get-selected-node";
import { useToolbarContext } from "@/components/toolbar-context";
import { Toggle } from "@/components/ui/toggle";
import { useUpdateToolbarHandler } from "@/components/use-update-toolbar";
import { sanitizeUrl } from "@/utils/editor/validateUrl";

export function LinkToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: (isEditMode: boolean) => void;
}) {
  const { activeEditor } = useToolbarContext();
  const [isLink, setIsLink] = useState(false);

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://"),
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);

  return (
    <Toggle
      variant="default"
      size="sm"
      aria-label="Toggle link"
      onClick={insertLink}
    >
      <LinkIcon className="size-4" />
    </Toggle>
  );
}
