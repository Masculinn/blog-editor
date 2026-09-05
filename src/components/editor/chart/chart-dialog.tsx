"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LexicalEditor, NodeKey } from "lexical";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useId, useState, type JSX } from "react";
import { INSERT_CHART_COMMAND, UPDATE_CHART_COMMAND } from "./chart-commands";
import { ChartRenderer } from "./chart-renderer";
import {
  CHART_COLORS,
  cloneChartPayload,
  DEFAULT_CHART_PAYLOAD,
  getNextSeriesKey,
  isChartPayloadValid,
  normalizeDataKey,
  type ChartPayload,
  type ChartType,
  type ChartValue,
} from "./chart-types";

interface ChartDialogBodyProps {
  initialValue?: ChartPayload;
  submitLabel?: string;
  onSubmit: (chart: ChartPayload) => void;
}

function ChartDialogBody({
  initialValue = DEFAULT_CHART_PAYLOAD,
  submitLabel = "Insert chart",
  onSubmit,
}: ChartDialogBodyProps) {
  const id = useId();

  const [chart, setChart] = useState<ChartPayload>(() =>
    cloneChartPayload(initialValue),
  );

  const isDisabled = !isChartPayloadValid(chart);

  function updateChart(updater: (current: ChartPayload) => ChartPayload) {
    setChart((current) => updater(current));
  }

  function renameKey(oldKey: string, requestedKey: string) {
    const nextKey = normalizeDataKey(requestedKey);

    if (!nextKey || nextKey === oldKey) return;

    const keyAlreadyExists =
      nextKey === chart.xKey ||
      chart.series.some(
        (series) => series.dataKey === nextKey && series.dataKey !== oldKey,
      );

    if (keyAlreadyExists) {
      return;
    }

    updateChart((current) => ({
      ...current,

      xKey: current.xKey === oldKey ? nextKey : current.xKey,

      series: current.series.map((series) =>
        series.dataKey === oldKey
          ? {
              ...series,
              dataKey: nextKey,
            }
          : series,
      ),

      data: current.data.map((datum) => {
        const nextDatum = {
          ...datum,
        };

        nextDatum[nextKey] = nextDatum[oldKey] ?? "";

        delete nextDatum[oldKey];

        return nextDatum;
      }),
    }));
  }

  function addSeries() {
    updateChart((current) => {
      const dataKey = getNextSeriesKey(current);

      const seriesIndex = current.series.length;

      return {
        ...current,

        series: [
          ...current.series,
          {
            dataKey,
            label: `Series ${seriesIndex + 1}`,
            color: CHART_COLORS[seriesIndex % CHART_COLORS.length],
          },
        ],

        data: current.data.map((datum) => ({
          ...datum,
          [dataKey]: 0,
        })),
      };
    });
  }

  function removeSeries(dataKey: string) {
    updateChart((current) => {
      if (current.series.length === 1) {
        return current;
      }

      return {
        ...current,
        series: current.series.filter((series) => series.dataKey !== dataKey),
        data: current.data.map((datum) => {
          const nextDatum = {
            ...datum,
          };

          delete nextDatum[dataKey];
          return nextDatum;
        }),
      };
    });
  }

  function addRow() {
    updateChart((current) => ({
      ...current,

      data: [
        ...current.data,
        {
          [current.xKey]: `Item ${current.data.length + 1}`,

          ...Object.fromEntries(
            current.series.map((series) => [series.dataKey, 0]),
          ),
        },
      ],
    }));
  }

  function removeRow(index: number) {
    updateChart((current) => {
      if (current.data.length === 1) {
        return current;
      }

      return {
        ...current,

        data: current.data.filter((_, rowIndex) => rowIndex !== index),
      };
    });
  }

  function updateDatum(rowIndex: number, dataKey: string, value: ChartValue) {
    updateChart((current) => ({
      ...current,

      data: current.data.map((datum, currentIndex) =>
        currentIndex === rowIndex
          ? {
              ...datum,
              [dataKey]: value,
            }
          : datum,
      ),
    }));
  }

  return (
    <div className="flex min-h-0 gap-6 w-min relative">
      <Tabs defaultValue="data" className="min-w-0 max-h-60 relative">
        <ScrollArea className="w-96 h-80 pr-3">
          <TabsList
            className="grid w-full grid-cols-3 sticky top-0 z-20 "
            variant="default"
          >
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-5">
            <FieldGroup>
              <div className="grid gap-4 grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${id}-title`}>Title</FieldLabel>

                  <Input
                    id={`${id}-title`}
                    value={chart.title}
                    placeholder="Monthly visitors"
                    onChange={(event) =>
                      setChart((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel>Chart type</FieldLabel>

                  <Select
                    value={chart.type}
                    onValueChange={(value) =>
                      setChart((current) => ({
                        ...current,
                        type: value as ChartType,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="bar">Bar</SelectItem>

                      <SelectItem value="line">Line</SelectItem>

                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor={`${id}-x-key`}>X-axis data key</FieldLabel>

                <Input
                  id={`${id}-x-key`}
                  value={chart.xKey}
                  onChange={(event) =>
                    renameKey(chart.xKey, event.target.value)
                  }
                />

                <FieldDescription>
                  This property identifies each row on the horizontal axis.
                </FieldDescription>
              </Field>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Dataset</h3>

                    <p className="text-muted-foreground text-xs">
                      Rows and columns update the preview immediately.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                  >
                    <PlusIcon />
                    Add row
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-36">{chart.xKey}</TableHead>

                        {chart.series.map((series) => (
                          <TableHead key={series.dataKey} className="min-w-32">
                            {series.label}
                          </TableHead>
                        ))}

                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {chart.data.map((datum, rowIndex) => (
                        <TableRow
                          // biome-ignore lint/suspicious/noArrayIndexKey: static index
                          key={rowIndex}
                        >
                          <TableCell>
                            <Input
                              value={datum[chart.xKey] ?? ""}
                              onChange={(event) =>
                                updateDatum(
                                  rowIndex,
                                  chart.xKey,
                                  event.target.value,
                                )
                              }
                            />
                          </TableCell>

                          {chart.series.map((series) => (
                            <TableCell key={series.dataKey}>
                              <Input
                                type="number"
                                value={datum[series.dataKey] ?? 0}
                                onChange={(event) => {
                                  const value = event.target.value;

                                  updateDatum(
                                    rowIndex,
                                    series.dataKey,
                                    value === "" ? "" : Number(value),
                                  );
                                }}
                              />
                            </TableCell>
                          ))}

                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={chart.data.length === 1}
                              onClick={() => removeRow(rowIndex)}
                            >
                              <Trash2Icon />

                              <span className="sr-only">Remove row</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </FieldGroup>
          </TabsContent>

          <TabsContent value="series" className="mt-5 space-y-4 ">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium">Data series</h3>

                <p className="text-muted-foreground text-xs">
                  Each series becomes a bar, line or area.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSeries}
              >
                <PlusIcon />
                Add series
              </Button>
            </div>

            {chart.series.map((series, seriesIndex) => (
              <Card key={series.dataKey} size="sm" className="bg-accent/20">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-sm">
                    {series.label || `Series ${seriesIndex + 1}`}
                  </CardTitle>
                  <CardAction>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      disabled={chart.series.length === 1}
                      onClick={() => removeSeries(series.dataKey)}
                    >
                      <Trash2Icon />
                      <span className="sr-only">Remove series</span>
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent>
                  <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Label</FieldLabel>

                        <Input
                          value={series.label}
                          onChange={(event) =>
                            setChart((current) => ({
                              ...current,

                              series: current.series.map((item) =>
                                item.dataKey === series.dataKey
                                  ? {
                                      ...item,
                                      label: event.target.value,
                                    }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </Field>

                      <Field>
                        <FieldLabel>Data key</FieldLabel>

                        <Input
                          value={series.dataKey}
                          onChange={(event) =>
                            renameKey(series.dataKey, event.target.value)
                          }
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel>Color</FieldLabel>

                      <div className="flex flex-wrap gap-2">
                        {CHART_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            aria-label={`Use ${color}`}
                            className="size-8 rounded-full border ring-offset-background transition-transform hover:scale-110 data-[active=true]:ring-2 data-[active=true]:ring-primary data-[active=true]:ring-offset-2"
                            data-active={series.color === color}
                            style={{
                              background: color,
                            }}
                            onClick={() =>
                              setChart((current) => ({
                                ...current,

                                series: current.series.map((item) =>
                                  item.dataKey === series.dataKey
                                    ? {
                                        ...item,
                                        color,
                                      }
                                    : item,
                                ),
                              }))
                            }
                          />
                        ))}
                      </div>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="appearance" className="mt-5 overflow-x-hidden">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${id}-height`}>Chart height</FieldLabel>

                <Input
                  id={`${id}-height`}
                  type="number"
                  min={200}
                  max={720}
                  value={chart.height}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    setChart((current) => ({
                      ...current,

                      height: Number.isFinite(value)
                        ? Math.min(720, Math.max(200, value))
                        : current.height,
                    }));
                  }}
                />

                <FieldDescription className="text-[10px]">
                  Between 200 and 720 pixels.
                </FieldDescription>
              </Field>

              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel htmlFor={`${id}-grid`}>Grid</FieldLabel>

                  <FieldDescription>
                    Display horizontal reference lines.
                  </FieldDescription>
                </div>

                <Switch
                  id={`${id}-grid`}
                  checked={chart.showGrid}
                  onCheckedChange={(checked) =>
                    setChart((current) => ({
                      ...current,
                      showGrid: checked,
                    }))
                  }
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel htmlFor={`${id}-legend`}>Legend</FieldLabel>

                  <FieldDescription>
                    Show labels for each data series.
                  </FieldDescription>
                </div>

                <Switch
                  id={`${id}-legend`}
                  checked={chart.showLegend}
                  onCheckedChange={(checked) =>
                    setChart((current) => ({
                      ...current,
                      showLegend: checked,
                    }))
                  }
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel htmlFor={`${id}-tooltip`}>Tooltip</FieldLabel>

                  <FieldDescription>
                    Display values while hovering over the chart.
                  </FieldDescription>
                </div>

                <Switch
                  id={`${id}-tooltip`}
                  checked={chart.showTooltip}
                  onCheckedChange={(checked) =>
                    setChart((current) => ({
                      ...current,
                      showTooltip: checked,
                    }))
                  }
                />
              </Field>
            </FieldGroup>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <Card size="sm" className="bg-accent/20">
        <CardContent>
          <ChartRenderer chart={chart} />
        </CardContent>
      </Card>
      <Button
        type="button"
        size="default"
        variant="success"
        disabled={isDisabled}
        className="bottom-0 left-0 absolute w-94 "
        onClick={() => {
          if (!isDisabled) {
            onSubmit(cloneChartPayload(chart));
          }
        }}
      >
        {submitLabel}
        <PlusIcon className="size-4" />
      </Button>
    </div>
  );
}

export function InsertChartDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  function onSubmit(chart: ChartPayload) {
    activeEditor.dispatchCommand(INSERT_CHART_COMMAND, chart);

    onClose();
  }

  return <ChartDialogBody onSubmit={onSubmit} submitLabel="Insert chart" />;
}

export function EditChartDialog({
  activeEditor,
  nodeKey,
  chart,
  onClose,
}: {
  activeEditor: LexicalEditor;
  nodeKey: NodeKey;
  chart: ChartPayload;
  onClose: () => void;
}): JSX.Element {
  function onSubmit(nextChart: ChartPayload) {
    activeEditor.dispatchCommand(UPDATE_CHART_COMMAND, {
      nodeKey,
      chart: nextChart,
    });

    onClose();
  }

  return (
    <ChartDialogBody
      initialValue={chart}
      onSubmit={onSubmit}
      submitLabel="Save changes"
    />
  );
}
