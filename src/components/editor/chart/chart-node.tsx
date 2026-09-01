import {
  DecoratorBlockNode,
  type SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode";
import {
  $applyNodeReplacement,
  type ElementFormatType,
  type LexicalEditor,
  type LexicalNode,
  type LexicalUpdateJSON,
  type NodeKey,
  type Spread,
} from "lexical";
import type { JSX } from "react";
import { ChartBlock } from "./chart-block";

import {
  cloneChartPayload,
  DEFAULT_CHART_PAYLOAD,
  type ChartPayload,
} from "./chart-types";

export type SerializedChartNode = Spread<
  {
    chart: ChartPayload;
  },
  SerializedDecoratorBlockNode
>;

export class ChartNode extends DecoratorBlockNode {
  __chart: ChartPayload;

  $config() {
    return this.config("chart", {
      extends: DecoratorBlockNode,
    });
  }

  constructor(
    chart: ChartPayload = DEFAULT_CHART_PAYLOAD,
    format?: ElementFormatType,
    key?: NodeKey,
  ) {
    super(format, key);

    this.__chart = cloneChartPayload(chart);
  }

  afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode);

    this.__chart = cloneChartPayload(prevNode.__chart);
  }

  static importJSON(serializedNode: SerializedChartNode): ChartNode {
    return $createChartNode(serializedNode.chart).updateFromJSON(
      serializedNode,
    );
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedChartNode>): this {
    return super.updateFromJSON(serializedNode).setChart(serializedNode.chart);
  }

  exportJSON(): SerializedChartNode {
    return {
      ...super.exportJSON(),

      chart: this.getChart(),
    };
  }

  getChart(): ChartPayload {
    return cloneChartPayload(this.getLatest().__chart);
  }

  setChart(chart: ChartPayload): this {
    const writable = this.getWritable();

    writable.__chart = cloneChartPayload(chart);

    return writable;
  }

  getTextContent(): string {
    const chart = this.getChart();

    return chart.title || "Chart";
  }

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <ChartBlock
        editor={editor}
        nodeKey={this.getKey()}
        chart={this.getChart()}
        format={this.getFormat()}
      />
    );
  }
}

export function $createChartNode(chart: ChartPayload): ChartNode {
  return $applyNodeReplacement(new ChartNode(chart));
}

export function $isChartNode(
  node: LexicalNode | null | undefined,
): node is ChartNode {
  return node instanceof ChartNode;
}
