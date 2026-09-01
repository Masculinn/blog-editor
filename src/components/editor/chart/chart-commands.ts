import { createCommand, type LexicalCommand, type NodeKey } from "lexical";
import type { ChartPayload } from "./chart-types";

export type InsertChartPayload = Readonly<ChartPayload>;

export interface UpdateChartPayload {
  nodeKey: NodeKey;
  chart: ChartPayload;
}

export const INSERT_CHART_COMMAND: LexicalCommand<InsertChartPayload> =
  createCommand("INSERT_CHART_COMMAND");

export const UPDATE_CHART_COMMAND: LexicalCommand<UpdateChartPayload> =
  createCommand("UPDATE_CHART_COMMAND");
