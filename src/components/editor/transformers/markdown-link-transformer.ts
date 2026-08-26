import { $isLinkNode } from "@lexical/link";
import { LINK, type TextMatchTransformer } from "@lexical/markdown";

export const MARKDOWN_LINK: TextMatchTransformer = {
  ...LINK,

  export: (node, exportChildren) => {
    if (!$isLinkNode(node)) {
      return null;
    }

    const text = exportChildren(node);
    const url = node.getURL();
    const title = node.getTitle();

    if (title) {
      const escapedTitle = title.replace(/([\\"])/g, "\\$1");

      return `[${text}](${url} "${escapedTitle}")`;
    }

    return `[${text}](${url})`;
  },
};
