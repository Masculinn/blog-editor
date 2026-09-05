"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $addUpdateTag,
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $isParagraphNode,
  HISTORY_PUSH_TAG,
  type NodeKey,
} from "lexical";
import {
  ArrowDownIcon,
  ListTreeIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { OPEN_CONTENTS_DIALOG_COMMAND } from "./contents-commands";
import { $isContentsNode } from "./contents-node";
import { ContentsRenderer } from "./contents-renderer";
import type { ContentsData } from "./contents-types";

type ContentsBlockProps = {
  nodeKey: NodeKey;
  data: ContentsData;
};

export function ContentsBlock({ nodeKey, data }: ContentsBlockProps) {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();

  function removeContents() {
    if (!editor.isEditable()) {
      return;
    }

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if (!$isContentsNode(node)) {
        return;
      }

      $addUpdateTag(HISTORY_PUSH_TAG);

      node.selectNext();
      node.remove();

      const root = $getRoot();

      if (root.getChildrenSize() === 0) {
        const paragraph = $createParagraphNode();

        root.append(paragraph);
        paragraph.select();
      }
    });
  }

  function continueWriting() {
    if (!editor.isEditable()) {
      return;
    }

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);

      if (!$isContentsNode(node)) {
        return;
      }

      const next = node.getNextSibling();

      if ($isParagraphNode(next)) {
        next.selectStart();
        return;
      }

      $addUpdateTag(HISTORY_PUSH_TAG);

      const paragraph = $createParagraphNode();

      node.insertAfter(paragraph);
      paragraph.select();
    });
  }

  return (
    <Card
      contentEditable={false}
      className="gap-0 overflow-hidden border-border/70 bg-card/40 py-0 shadow-none"
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <ListTreeIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />

          <CardTitle className="text-base font-semibold tracking-tight">
            Table of Contents
          </CardTitle>
        </div>

        {isEditable && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.dispatchCommand(OPEN_CONTENTS_DIALOG_COMMAND, nodeKey)
              }
            >
              <PencilIcon aria-hidden="true" className="size-3.5" />
              Edit
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete table of contents"
              onClick={removeContents}
              className="size-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2Icon aria-hidden="true" className="size-3.5" />
            </Button>
          </div>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="px-5 py-5">
        <ContentsRenderer data={data} preventNavigation={isEditable} />
        {isEditable && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={continueWriting}
            className="mt-4 text-muted-foreground"
          >
            <ArrowDownIcon aria-hidden="true" className="size-3.5" />
            Continue writing
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
