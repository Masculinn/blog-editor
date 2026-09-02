import {
  $convertToMarkdownString,
  $generateNodesFromMarkdownString,
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
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

import { CHART_TRANSFORMER } from "../chart/chart-markdown-transformer";
import { EMOJI } from "./markdown-emoji-transformer";
import { HR } from "./markdown-hr-transformer";
import { IMAGE } from "./markdown-image-transformer";
import { TABLE } from "./markdown-table-transformer";

const DETAILS_START_REGEX = /^\s*<details\b([^>]*)>\s*/i,
  DETAILS_END_REGEX = /\s*<\/details>\s*$/i,
  SUMMARY_REGEX = /^\s*<summary\b[^>]*>(.*?)<\/summary>\s*(.*)$/i;

const DETAILS: MultilineElementTransformer = {
  type: "multiline-element",
  dependencies: [DetailsContainerNode, DetailsSummaryNode, DetailsContentNode],
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

    const contentMarkdown = content
      ? $convertToMarkdownString(MARKDOWN_TRANSFORMERS, content, true).trim()
      : "";

    const openAttribute = node.getOpen() ? " open" : "";
    const result = [
      `<details${openAttribute}>`,
      `<summary>${summaryMarkdown}</summary>`,
    ];

    if (contentMarkdown) {
      result.push("", contentMarkdown);
    }

    result.push("", "</details>");

    return result.join("\n");
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

    /*
     * <details>
     * <details open>
     * <details open="">
     * <details open="open">
     */
    const attributes = startMatch[1] ?? "";

    const isOpen =
      /(?:^|\s)open(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s]+))?(?=\s|$)/i.test(
        attributes,
      );

    const lines = [...linesInBetween];

    let summaryMarkdown = "Summary";

    /*
     * <summary></summary>
     * <summary>Shopping list</summary> Some text
     */
    const summaryIndex = lines.findIndex((line) => SUMMARY_REGEX.test(line));

    if (summaryIndex >= 0) {
      const summaryMatch = lines[summaryIndex].match(SUMMARY_REGEX);

      if (summaryMatch) {
        summaryMarkdown = summaryMatch[1].trim();

        const remainder = summaryMatch[2].trim();

        lines.splice(0, summaryIndex + 1);

        if (remainder) {
          lines.unshift(remainder);
        }
      }
    }
    while (lines.length > 0 && lines[0].trim() === "") {
      lines.shift();
    }

    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }

    const details = $createDetailsContainerNode(isOpen);

    const summary = $createDetailsSummaryNode();

    const content = $createDetailsContentNode();

    if (summaryMarkdown) {
      const summaryNodes = $generateNodesFromMarkdownString(
        summaryMarkdown,
        MARKDOWN_TRANSFORMERS,
        true,
      );

      const firstSummaryNode = summaryNodes[0];

      if (summaryNodes.length === 1 && $isParagraphNode(firstSummaryNode)) {
        summary.append(...firstSummaryNode.getChildren());
      } else {
        summary.append($createTextNode(summaryMarkdown));
      }
    } else {
      summary.append($createTextNode("Summary"));
    }

    const bodyMarkdown = lines.join("\n").trim();

    if (bodyMarkdown) {
      const bodyNodes = $generateNodesFromMarkdownString(
        bodyMarkdown,
        MARKDOWN_TRANSFORMERS,
        true,
      );

      content.append(...bodyNodes);
    }

    if (content.getChildrenSize() === 0) {
      content.append($createParagraphNode());
    }

    details.append(summary, content);

    rootNode.append(details);
  },
};

export const MARKDOWN_TRANSFORMERS: Transformer[] = [
  CHART_TRANSFORMER,
  DETAILS,
  TABLE,
  HR,
  IMAGE,
  EMOJI,
  CHECK_LIST,

  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];
