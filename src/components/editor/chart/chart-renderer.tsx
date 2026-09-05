"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { cn } from "@/lib/utils";

import type { ChartPayload } from "./chart-types";

interface ChartRendererProps {
  chart: ChartPayload;
  className?: string;
  isAnimationActive?: boolean;
}

export function ChartRenderer({
  chart,
  className,
  isAnimationActive,
}: ChartRendererProps) {
  const config = Object.fromEntries(
    chart.series.map((series) => [
      series.dataKey,
      {
        label: series.label,
        color: series.color,
      },
    ]),
  ) as ChartConfig;

  const common = (
    <>
      {chart.showGrid && (
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
      )}

      <XAxis
        dataKey={chart.xKey}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
      />

      <YAxis width="auto" tickLine={false} axisLine={false} />

      {chart.showTooltip && (
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      )}

      {chart.showLegend && <ChartLegend content={<ChartLegendContent />} />}
    </>
  );

  return (
    <ChartContainer
      config={config}
      className={cn("w-full min-h-50", className)}
      style={{
        height: chart.height,
      }}
    >
      {chart.type === "bar" ? (
        <BarChart accessibilityLayer data={chart.data}>
          {common}

          {chart.series.map((series) => (
            <Bar
              isAnimationActive={isAnimationActive}
              key={series.dataKey}
              dataKey={series.dataKey}
              fill={series.color}
              radius={4}
            />
          ))}
        </BarChart>
      ) : chart.type === "area" ? (
        <AreaChart accessibilityLayer data={chart.data}>
          {common}

          {chart.series.map((series) => (
            <Area
              isAnimationActive={isAnimationActive}
              key={series.dataKey}
              dataKey={series.dataKey}
              stroke={series.color}
              fill={series.color}
              fillOpacity={0.18}
              type="monotone"
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart accessibilityLayer data={chart.data}>
          {common}

          {chart.series.map((series) => (
            <Line
              isAnimationActive={isAnimationActive}
              key={series.dataKey}
              dataKey={series.dataKey}
              stroke={series.color}
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          ))}
        </LineChart>
      )}
    </ChartContainer>
  );
}
