import {
  $convertToMarkdownString,
  $generateNodesFromMarkdownString,
  type MultilineElementTransformer,
  type Transformer,
} from "@lexical/markdown";

import {
  $createParagraphNode,
  $createTextNode,
  $isParagraphNode,
} from "lexical";

import {
  $createDetailsContainerNode,
  $isDetailsContainerNode,
  DetailsContainerNode,
} from "@/components/editor/nodes/details-container-node";

import {
  $createDetailsContentNode,
  $isDetailsContentNode,
  DetailsContentNode,
} from "@/components/editor/nodes/details-content-node";

import {
  $createDetailsSummaryNode,
  $isDetailsSummaryNode,
  DetailsSummaryNode,
} from "@/components/editor/nodes/details-summary-node";

const DETAILS_START_REGEX = /^\s*<details\b([^>]*)>\s*/i;
const DETAILS_END_REGEX = /<\/details>\s*$/i;

const SUMMARY_REGEX = /^\s*<summary\b[^>]*>(.*?)<\/summary>\s*(.*)$/i;

export function createDetailsMarkdownTransformer(
  getTransformers: () => Transformer[],
): MultilineElementTransformer {
  return {
    type: "multiline-element",

    dependencies: [
      DetailsContainerNode,
      DetailsSummaryNode,
      DetailsContentNode,
    ],

    regExpStart: DETAILS_START_REGEX,
    regExpEnd: DETAILS_END_REGEX,

    export: (node, traverseChildren) => {
      if (!$isDetailsContainerNode(node)) {
        return null;
      }

      const summary = node.getChildren().find($isDetailsSummaryNode);

      const content = node.getChildren().find($isDetailsContentNode);

      const summaryMarkdown = summary
        ? traverseChildren(summary).trim()
        : "Summary";

      // Important:
      // Don't use traverseChildren(content) here.
      //
      // That only handles inline/text transformers and would flatten
      // block children such as ListNode.
      const contentMarkdown = content
        ? $convertToMarkdownString(getTransformers(), content, true).trim()
        : "";

      const open = node.getOpen() ? " open" : "";

      return [
        `<details${open}>`,
        `<summary>${summaryMarkdown}</summary>`,
        "",
        contentMarkdown,
        "",
        "</details>",
      ].join("\n");
    },

    replace: (
      rootNode,
      _children,
      startMatch,
      _endMatch,
      linesInBetween,
      _isImport,
    ) => {
      if (!linesInBetween) {
        return false;
      }

      const attrs = startMatch[1] ?? "";

      const isOpen =
        /(?:^|\s)open(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s]+))?(?=\s|$)/i.test(
          attrs,
        );

      const lines = [...linesInBetween];

      let summaryMarkdown = "Summary";

      const summaryIndex = lines.findIndex((line) => SUMMARY_REGEX.test(line));

      if (summaryIndex >= 0) {
        const summaryMatch = lines[summaryIndex].match(SUMMARY_REGEX);

        if (summaryMatch) {
          summaryMarkdown = summaryMatch[1].trim();

          const remainder = summaryMatch[2].trim();

          // Remove everything through the <summary> line.
          lines.splice(0, summaryIndex + 1);

          // Supports:
          // <summary>Title</summary> some content
          if (remainder) {
            lines.unshift(remainder);
          }
        }
      }

      // Remove blank lines immediately surrounding the body.
      while (lines.length > 0 && lines[0].trim() === "") {
        lines.shift();
      }

      while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
      }

      const details = $createDetailsContainerNode(isOpen);
      const summary = $createDetailsSummaryNode();
      const content = $createDetailsContentNode();

      /*
       * Parse Markdown formatting inside <summary>.
       *
       * Example:
       * <summary>**Shopping** list</summary>
       */
      const summaryNodes = $generateNodesFromMarkdownString(
        summaryMarkdown,
        getTransformers(),
        true,
      );

      if (summaryNodes.length === 1 && $isParagraphNode(summaryNodes[0])) {
        summary.append(...summaryNodes[0].getChildren());
      } else {
        summary.append($createTextNode(summaryMarkdown));
      }

      /*
       * Parse the body as actual Markdown so:
       *
       * - Vegetables
       * - Fruits
       * - Fish
       *
       * becomes a real Lexical ListNode rather than plain text.
       */
      const bodyMarkdown = lines.join("\n");

      if (bodyMarkdown) {
        const bodyNodes = $generateNodesFromMarkdownString(
          bodyMarkdown,
          getTransformers(),
          true,
        );

        content.append(...bodyNodes);
      }

      if (content.isEmpty()) {
        content.append($createParagraphNode());
      }

      details.append(summary, content);
      rootNode.append(details);
    },
  };
}
