import type { MultilineElementTransformer } from "@lexical/markdown";
import { $createChartNode, $isChartNode, ChartNode } from "./chart-node";
import { isChartPayloadValid, type ChartPayload } from "./chart-types";

export const CHART_TRANSFORMER: MultilineElementTransformer = {
  type: "multiline-element",
  dependencies: [ChartNode],
  regExpStart: /^```chart\s*$/i,
  regExpEnd: /^```\s*$/,
  export: (node) => {
    if (!$isChartNode(node)) {
      return null;
    }

    return ["```chart", JSON.stringify(node.getChart(), null, 2), "```"].join(
      "\n",
    );
  },
  replace: (rootNode, _children, _startMatch, _endMatch, linesInBetween) => {
    if (!linesInBetween) {
      return false;
    }

    try {
      const parsed = JSON.parse(linesInBetween.join("\n")) as ChartPayload;

      if (!isChartPayloadValid(parsed)) {
        return false;
      }

      rootNode.append($createChartNode(parsed));

      return true;
    } catch {
      return false;
    }
  },
};
