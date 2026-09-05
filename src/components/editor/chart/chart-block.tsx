"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import {
  $getNodeByKey,
  type ElementFormatType,
  type LexicalEditor,
  type NodeKey,
} from "lexical";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { EditChartDialog } from "./chart-dialog";
import { ChartRenderer } from "./chart-renderer";
import type { ChartPayload } from "./chart-types";

interface ChartBlockProps {
  editor: LexicalEditor;
  nodeKey: NodeKey;
  chart: ChartPayload;
  format?: ElementFormatType | null;
}

export function ChartBlock({
  editor,
  nodeKey,
  chart,
  format,
}: ChartBlockProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  function removeChart() {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
  }

  return (
    <>
      <BlockWithAlignableContents
        nodeKey={nodeKey}
        format={format}
        className={{
          base: "group/chart relative my-6 rounded-xl border bg-card/60 p-4 shadow-sm transition-shadow",
          focus: "ring-2 ring-primary ring-offset-2 ring-offset-background",
        }}
      >
        {/** biome-ignore lint/a11y/noStaticElementInteractions: false positive */}
        <div className="relative" onDoubleClick={() => setIsEditOpen(true)}>
          <div className="absolute right-0 top-0 z-10 flex translate-y-[-50%] gap-1 rounded-lg border bg-background/95 p-1 opacity-0 shadow-sm  transition-opacity group-hover/chart:opacity-100">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setIsEditOpen(true)}
                  />
                }
              >
                <PencilIcon />
                <span className="sr-only">Edit chart</span>
              </TooltipTrigger>

              <TooltipContent>Edit chart</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={removeChart}
                  />
                }
              >
                <Trash2Icon />

                <span className="sr-only">Delete chart</span>
              </TooltipTrigger>

              <TooltipContent>Delete chart</TooltipContent>
            </Tooltip>
          </div>

          {chart.title && (
            <div className="mb-4">
              <h3 className="font-medium tracking-tight">{chart.title}</h3>
            </div>
          )}

          <ChartRenderer chart={chart} />
        </div>
      </BlockWithAlignableContents>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[92vh] sm:max-w-6xl border">
          <DialogHeader>
            <DialogTitle>Edit chart</DialogTitle>
          </DialogHeader>
          {isEditOpen && (
            <EditChartDialog
              activeEditor={editor}
              nodeKey={nodeKey}
              chart={chart}
              onClose={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
