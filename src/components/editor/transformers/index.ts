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

import { EMOJI } from "./markdown-emoji-transformer";
import { HR } from "./markdown-hr-transformer";
import { IMAGE } from "./markdown-image-transformer";
import { TABLE } from "./markdown-table-transformer";

const DETAILS_START_REGEX = /^\s*<details\b([^>]*)>\s*/i;

const DETAILS_END_REGEX = /\s*<\/details>\s*$/i;

const SUMMARY_REGEX = /^\s*<summary\b[^>]*>(.*?)<\/summary>\s*(.*)$/i;

export const DETAILS: MultilineElementTransformer = {
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

    /*
     * Don't use traverseChildren(content) here.
     *
     * DetailsContentNode contains block-level nodes such as:
     *
     * - ParagraphNode
     * - ListNode
     * - QuoteNode
     * - CodeNode
     * - another DetailsContainerNode
     *
     * $convertToMarkdownString() makes those nodes go through the
     * complete transformer pipeline again.
     */
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
     * startMatch[1] contains the attributes from:
     *
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
     * Find:
     *
     * <summary>Shopping list</summary>
     *
     * Also supports content immediately following it:
     *
     * <summary>Shopping list</summary> Some text
     */
    const summaryIndex = lines.findIndex((line) => SUMMARY_REGEX.test(line));

    if (summaryIndex >= 0) {
      const summaryMatch = lines[summaryIndex].match(SUMMARY_REGEX);

      if (summaryMatch) {
        summaryMarkdown = summaryMatch[1].trim();

        const remainder = summaryMatch[2].trim();

        /*
         * Remove everything up through the summary line.
         */
        lines.splice(0, summaryIndex + 1);

        /*
         * If body content exists on the same line as </summary>,
         * preserve it.
         */
        if (remainder) {
          lines.unshift(remainder);
        }
      }
    }

    /*
     * Remove blank lines surrounding the body.
     */
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
     * Parse Markdown inside <summary>.
     *
     * Example:
     *
     * <summary>**Shopping** list</summary>
     *
     * produces formatted Lexical text rather than literal **.
     */
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
        /*
         * A <summary> should contain inline content, not arbitrary
         * block structures, so fall back to plain text if the parsed
         * Markdown isn't a simple paragraph.
         */
        summary.append($createTextNode(summaryMarkdown));
      }
    } else {
      summary.append($createTextNode("Summary"));
    }

    /*
     * Everything following </summary> and preceding </details>
     * gets parsed again using the complete Markdown transformer list.
     *
     * Therefore:
     *
     * * Vegetables
     * * Fruits
     * * Fish
     *
     * becomes an actual ListNode.
     */
    const bodyMarkdown = lines.join("\n").trim();

    if (bodyMarkdown) {
      const bodyNodes = $generateNodesFromMarkdownString(
        bodyMarkdown,
        MARKDOWN_TRANSFORMERS,
        true,
      );

      content.append(...bodyNodes);
    }

    /*
     * Keep DetailsContentNode editable even when it has no content.
     */
    if (content.getChildrenSize() === 0) {
      content.append($createParagraphNode());
    }

    details.append(summary, content);

    rootNode.append(details);
  },
};

export const MARKDOWN_TRANSFORMERS: Transformer[] = [
  /*
   * Custom multiline/block transformers should come first.
   */
  DETAILS,
  TABLE,

  /*
   * Your existing custom transformers.
   */
  HR,
  IMAGE,
  EMOJI,

  /*
   * Lexical doesn't include CHECK_LIST inside
   * ELEMENT_TRANSFORMERS, so keep this explicitly.
   */
  CHECK_LIST,

  /*
   * Built-in Markdown transformers.
   */
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];
