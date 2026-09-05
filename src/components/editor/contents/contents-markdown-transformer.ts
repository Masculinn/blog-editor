import type { MultilineElementTransformer } from "@lexical/markdown";

import {
  parseContentsMarkdown,
  serializeContentsMarkdown,
} from "./contents-markdown";
import {
  $createContentsNode,
  $isContentsNode,
  ContentsNode,
} from "./contents-node";

export const CONTENTS_TRANSFORMER: MultilineElementTransformer = {
  type: "multiline-element",

  dependencies: [ContentsNode],

  regExpStart: /^[ \t]*<Contents>[ \t]*$/u,

  regExpEnd: /^[ \t]*<\/Contents>[ \t]*$/u,

  export: (node) => {
    if (!$isContentsNode(node)) {
      return null;
    }

    return serializeContentsMarkdown(node.getData());
  },

  replace: (
    rootNode,
    _children,
    _startMatch,
    endMatch,
    linesInBetween,
    isImport,
  ) => {
    if (!isImport || !endMatch || !linesInBetween) {
      return false;
    }

    const data = parseContentsMarkdown(linesInBetween.join("\n"));

    if (!data) {
      return false;
    }

    rootNode.append($createContentsNode(data));

    return true;
  },
};
