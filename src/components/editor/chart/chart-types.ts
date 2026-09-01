export type ChartType = "line" | "bar" | "area";

export type ChartValue = string | number;

type ChartDatum = Record<string, ChartValue>;

interface ChartSeries {
  dataKey: string;
  label: string;
  color: string;
}

export interface ChartPayload {
  type: ChartType;

  title: string;

  xKey: string;

  data: ChartDatum[];

  series: ChartSeries[];

  height: number;

  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
}

export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const DEFAULT_CHART_PAYLOAD: ChartPayload = {
  type: "bar",

  title: "Monthly visitors",

  xKey: "month",

  data: [
    {
      month: "January",
      visitors: 186,
    },
    {
      month: "February",
      visitors: 305,
    },
    {
      month: "March",
      visitors: 237,
    },
    {
      month: "April",
      visitors: 273,
    },
  ],

  series: [
    {
      dataKey: "visitors",
      label: "Visitors",
      color: CHART_COLORS[0],
    },
  ],

  height: 320,

  showGrid: true,
  showLegend: true,
  showTooltip: true,
};

export function cloneChartPayload(payload: ChartPayload): ChartPayload {
  return {
    ...payload,

    data: payload.data.map((datum) => ({
      ...datum,
    })),

    series: payload.series.map((series) => ({
      ...series,
    })),
  };
}

export function normalizeDataKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^(\d)/, "_$1");
}

export function getNextSeriesKey(payload: ChartPayload): string {
  const existing = new Set(payload.series.map((series) => series.dataKey));

  let index = payload.series.length + 1;

  while (existing.has(`series_${index}`)) {
    index++;
  }

  return `series_${index}`;
}

export function isChartPayloadValid(payload: unknown): payload is ChartPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const chart = payload as Partial<ChartPayload>;

  if (chart.type !== "line" && chart.type !== "bar" && chart.type !== "area") {
    return false;
  }

  if (
    typeof chart.title !== "string" ||
    typeof chart.xKey !== "string" ||
    chart.xKey.trim() === ""
  ) {
    return false;
  }

  if (
    typeof chart.height !== "number" ||
    !Number.isFinite(chart.height) ||
    chart.height < 200
  ) {
    return false;
  }

  if (
    typeof chart.showGrid !== "boolean" ||
    typeof chart.showLegend !== "boolean" ||
    typeof chart.showTooltip !== "boolean"
  ) {
    return false;
  }

  if (!Array.isArray(chart.series) || chart.series.length === 0) {
    return false;
  }

  if (!Array.isArray(chart.data) || chart.data.length === 0) {
    return false;
  }

  const keys = new Set<string>([chart.xKey]);

  for (const series of chart.series) {
    if (
      !series ||
      typeof series !== "object" ||
      typeof series.dataKey !== "string" ||
      series.dataKey.trim() === "" ||
      typeof series.label !== "string" ||
      typeof series.color !== "string"
    ) {
      return false;
    }

    if (keys.has(series.dataKey)) {
      return false;
    }

    keys.add(series.dataKey);
  }

  for (const datum of chart.data) {
    if (!datum || typeof datum !== "object") {
      return false;
    }

    if (!(chart.xKey in datum)) {
      return false;
    }

    for (const series of chart.series) {
      const value = datum[series.dataKey];

      if (typeof value !== "number" || !Number.isFinite(value)) {
        return false;
      }
    }
  }

  return true;
}
