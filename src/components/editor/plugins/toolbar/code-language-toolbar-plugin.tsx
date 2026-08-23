import { $isCodeNode } from "@lexical/code";
import {
  getCodeLanguageOptions,
  normalizeCodeLanguage,
} from "@lexical/code-prism";
import { $findMatchingParent } from "@lexical/utils";
import {
  $addUpdateTag,
  $getNodeByKey,
  $isRangeSelection,
  $isRootOrShadowRoot,
  type BaseSelection,
  type NodeKey,
  SKIP_SELECTION_FOCUS_TAG,
} from "lexical";
import { useState } from "react";

import { useToolbarContext } from "@/components/toolbar-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateToolbarHandler } from "@/components/use-update-toolbar";

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

export function CodeLanguageToolbarPlugin() {
  const { activeEditor } = useToolbarContext();

  const [codeLanguage, setCodeLanguage] = useState<string | null>(null);
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );

  function $updateToolbar(selection: BaseSelection) {
    if (!$isRangeSelection(selection)) {
      return;
    }

    const anchorNode = selection.anchor.getNode();

    let element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : $findMatchingParent(anchorNode, (node) => {
            const parent = node.getParent();

            return parent !== null && $isRootOrShadowRoot(parent);
          });

    if (element === null) {
      element = anchorNode.getTopLevelElementOrThrow();
    }

    const elementKey = element.getKey();
    const elementDOM = activeEditor.getElementByKey(elementKey);

    if (elementDOM === null) {
      return;
    }

    setSelectedElementKey(elementKey);

    if (!$isCodeNode(element)) {
      setCodeLanguage(null);
      return;
    }

    const language = element.getLanguage();

    setCodeLanguage(
      language ? normalizeCodeLanguage(language) || language : null,
    );
  }

  useUpdateToolbarHandler($updateToolbar);

  function onCodeLanguageSelect(value: string | null) {
    activeEditor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);

      if (selectedElementKey === null) {
        return;
      }

      const node = $getNodeByKey(selectedElementKey);

      if ($isCodeNode(node)) {
        node.setLanguage(value);
      }
    });
  }

  return (
    <Select value={codeLanguage} onValueChange={onCodeLanguageSelect}>
      <SelectTrigger
        size="sm"
        className="border-none bg-transparent shadow-none hover:bg-muted dark:bg-transparent dark:hover:bg-muted"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <SelectValue placeholder="Select Language" />
      </SelectTrigger>

      <SelectContent finalFocus={false}>
        {CODE_LANGUAGE_OPTIONS.map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
