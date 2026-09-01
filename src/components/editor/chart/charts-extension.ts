import {
  $createParagraphNode,
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  defineExtension,
  mergeRegister,
} from "lexical";

import { $insertNodeToNearestRoot } from "@lexical/utils";

import { INSERT_CHART_COMMAND, UPDATE_CHART_COMMAND } from "./chart-commands";

import { $createChartNode, $isChartNode, ChartNode } from "./chart-node";

export const ChartsExtension = defineExtension({
  name: "Charts",

  nodes: [ChartNode],

  register: (editor) =>
    mergeRegister(
      editor.registerCommand(
        INSERT_CHART_COMMAND,
        (payload) => {
          const chartNode = $createChartNode(payload);

          $insertNodeToNearestRoot(chartNode);

          const paragraph = $createParagraphNode();

          chartNode.insertAfter(paragraph);

          paragraph.selectStart();

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),

      editor.registerCommand(
        UPDATE_CHART_COMMAND,
        ({ nodeKey, chart }) => {
          const node = $getNodeByKey(nodeKey);

          if (!$isChartNode(node)) {
            return false;
          }

          node.setChart(chart);

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    ),
});
