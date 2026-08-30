"use client";

import { CodeExtension } from "@lexical/code";
import {
  DecoratorTextExtension,
  HorizontalRuleExtension,
} from "@lexical/extension";
import { ClickableLinkExtension, LinkExtension } from "@lexical/link";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { OverflowNode } from "@lexical/overflow";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { RichTextExtension } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { configExtension, defineExtension } from "lexical";
import { useMemo } from "react";

import { ContentEditable } from "@/components/content-editable";

import { AutoLinkExtension } from "@/components/editor/extensions/auto-link-extension";
import { DateTimeExtension } from "@/components/editor/extensions/date-time-extension";
import { EmojisExtension } from "@/components/editor/extensions/emojis-extension";
import { ImagesExtension } from "@/components/editor/extensions/images-extension";

import { EmojiNode } from "@/components/editor/nodes/emoji-node";
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node";
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node";
import { SpecialTextNode } from "@/components/editor/nodes/special-text-node";

import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin";
import { SpecialTextPlugin } from "@/components/editor/plugins/special-text-plugin";
import { UrlDocumentSyncPlugin } from "@/components/editor/plugins/url-document-sync-plugin";

import { editorTheme } from "@/components/editor/themes/editor-theme";

import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { validateUrl } from "@/utils/editor/validateUrl";
import { formatTime } from "@/utils/formatTime";

const VIEWER_NODES = [
  OverflowNode,
  EmojiNode,
  SpecialTextNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LayoutContainerNode,
  LayoutItemNode,
];

export function ExperimentalDocumentViewer({
  documentHash,
  className,
  title,
  timestamp,
}: {
  documentHash: string;
  className?: string;
  title: string;
  timestamp: string;
}) {
  const viewerExtension = useMemo(
    () =>
      defineExtension({
        name: "burakdev-blog-viewer",
        namespace: "DocumentViewer",
        theme: editorTheme,

        dependencies: [
          RichTextExtension,
          CodeExtension,

          configExtension(LinkExtension, {
            validateUrl,
            attributes: {
              rel: "noopener noreferrer",
              target: "_blank",
            },
          }),

          AutoLinkExtension,
          ClickableLinkExtension,

          DecoratorTextExtension,

          configExtension(ListExtension, {
            shouldPreserveNumbering: false,
            hasStrictIndent: false,
          }),

          CheckListExtension,
          HorizontalRuleExtension,

          EmojisExtension,
          ImagesExtension,
          DateTimeExtension,
        ],

        nodes: VIEWER_NODES,

        $initialEditorState(editor) {
          editor.setEditable(false);
        },
      }),
    [],
  );

  return (
    <div
      className={cn(
        "bg-background/65 size-full rounded-lg border shadow flex flex-col relative",
        className,
      )}
    >
      <Item
        className="md:top-4 md:right-4 md:bottom-auto bottom-4 right-4  absolute w-72"
        size="xs"
        variant="outline"
      >
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Badge className="text-[10px]">{formatTime(timestamp)}</Badge>
        </ItemActions>
      </Item>
      <LexicalExtensionComposer
        key={documentHash}
        extension={viewerExtension}
        contentEditable={null}
      >
        <div className="relative size-full">
          <div className="relative size-full w-full">
            <div className="overflow-y-scroll size-full scrollbar-custom scroll-fade">
              <ContentEditable
                placeholder=""
                className="p-4 size-full selection:bg-primary/50 selection:text-primary-muted"
                placeholderClassName="top-4 left-4"
              />
            </div>

            <UrlDocumentSyncPlugin documentHash={documentHash} />

            <SpecialTextPlugin />
            <CodeHighlightPlugin />
          </div>
        </div>
      </LexicalExtensionComposer>
    </div>
  );
}
