"use client";

import { CodeExtension } from "@lexical/code";
import {
  AutoFocusExtension,
  ClearEditorExtension,
  DecoratorTextExtension,
  HorizontalRuleExtension,
} from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import { ClickableLinkExtension, LinkExtension } from "@lexical/link";
import { CheckListExtension, ListExtension } from "@lexical/list";
import { OverflowNode } from "@lexical/overflow";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { RichTextExtension } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  configExtension,
  defineExtension,
  type EditorState,
  type SerializedEditorState,
} from "lexical";
import { useCallback, useMemo, useRef, useState } from "react";

import { ContentEditable } from "@/components/content-editable";

import { AutoLinkExtension } from "@/components/editor/extensions/auto-link-extension";
import { DateTimeExtension } from "@/components/editor/extensions/date-time-extension";
import { EmojisExtension } from "@/components/editor/extensions/emojis-extension";
import { ImagesExtension } from "@/components/editor/extensions/images-extension";
import { MarkdownShortcutsExtension } from "@/components/editor/extensions/markdown-shortcuts-extension";
import { MaxLengthExtension } from "@/components/editor/extensions/max-length-extension";

import { EmojiNode } from "@/components/editor/nodes/emoji-node";
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node";
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node";
import { SpecialTextNode } from "@/components/editor/nodes/special-text-node";

import { ClearEditorActionPlugin } from "@/components/editor/plugins/actions/clear-editor-plugin";
import { CounterCharacterPlugin } from "@/components/editor/plugins/actions/counter-character-plugin";
import { MarkdownTogglePlugin } from "@/components/editor/plugins/actions/markdown-toggle-plugin";

import { CodeActionMenuPlugin } from "@/components/editor/plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin";
import { ComponentPickerMenuPlugin } from "@/components/editor/plugins/component-picker-menu-plugin";
import { ContextMenuPlugin } from "@/components/editor/plugins/context-menu-plugin";
import { DraggableBlockPlugin } from "@/components/editor/plugins/draggable-block-plugin";
import { EmojiPickerPlugin } from "@/components/editor/plugins/emoji-picker-plugin";
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/plugins/floating-text-format-plugin";

import { BulletedListPickerPlugin } from "@/components/editor/plugins/picker/bulleted-list-picker-plugin";
import { CheckListPickerPlugin } from "@/components/editor/plugins/picker/check-list-picker-plugin";
import { CodePickerPlugin } from "@/components/editor/plugins/picker/code-picker-plugin";
import { DateTimePickerPlugin } from "@/components/editor/plugins/picker/date-time-picker-plugin";
import { DividerPickerPlugin } from "@/components/editor/plugins/picker/divider-picker-plugin";
import { HeadingPickerPlugin } from "@/components/editor/plugins/picker/heading-picker-plugin";
import { ImagePickerPlugin } from "@/components/editor/plugins/picker/image-picker-plugin";
import { NumberedListPickerPlugin } from "@/components/editor/plugins/picker/numbered-list-picker-plugin";
import { ParagraphPickerPlugin } from "@/components/editor/plugins/picker/paragraph-picker-plugin";
import { QuotePickerPlugin } from "@/components/editor/plugins/picker/quote-picker-plugin";
import {
  DynamicTablePickerPlugin,
  TablePickerPlugin,
} from "@/components/editor/plugins/picker/table-picker-plugin";

import { SpecialTextPlugin } from "@/components/editor/plugins/special-text-plugin";
import { TabFocusPlugin } from "@/components/editor/plugins/tab-focus-plugin";

import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatCodeBlock } from "@/components/editor/plugins/toolbar/block-format/format-code-block";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";

import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { CodeLanguageToolbarPlugin } from "@/components/editor/plugins/toolbar/code-language-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";

import { editorTheme } from "@/components/editor/themes/editor-theme";

import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ChartsExtension } from "@/components/editor/chart/charts-extension";
import { DetailsContainerNode } from "@/components/editor/nodes/details-container-node";
import { DetailsContentNode } from "@/components/editor/nodes/details-content-node";
import { DetailsSummaryNode } from "@/components/editor/nodes/details-summary-node";
import { AutoCompletePlugin } from "@/components/editor/plugins/auto-complete-plugin";
import { DetailsEscapePlugin } from "@/components/editor/plugins/details-escape-plugin";
import { DetailsPickerPlugin } from "@/components/editor/plugins/details-picker-plugin";
import { ChartPickerPlugin } from "@/components/editor/plugins/picker/chart-picker-plugin";
import { UrlClientDocumentSyncPlugin } from "@/components/editor/plugins/url-client-document-sync-plugin";
import { MARKDOWN_TRANSFORMERS } from "@/components/editor/transformers";
import { cn } from "@/lib/utils";
import { validateUrl } from "@/utils/editor/validateUrl";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { ToggleViewer } from "../document-viewer/toggle-viewer";

const PLACEHOLDER = "Press / to open up the commands";

const EDITOR_NODES = [
  OverflowNode,
  EmojiNode,
  SpecialTextNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LayoutContainerNode,
  LayoutItemNode,
  DetailsSummaryNode,
  DetailsContentNode,
  DetailsContainerNode,
];

export type EditorProps = {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  initialMarkdown?: string | null;
  className?: string;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
};

export function Editor({
  editorState,
  editorSerializedState,
  initialMarkdown,
  onChange,
  onSerializedChange,
  className,
}: EditorProps) {
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const initialStateRef = useRef({
    editorState,
    editorSerializedState,
  });

  const onFloatingAnchorRef = useCallback((element: HTMLDivElement | null) => {
    scrollContainerRef.current = element;
    setFloatingAnchorElem(element);
  }, []);

  const editorExtension = useMemo(
    () =>
      defineExtension({
        name: "justcode-sessions-blog-editor",
        namespace: "Editor",
        theme: editorTheme,

        dependencies: [
          RichTextExtension,
          AutoFocusExtension,
          HistoryExtension,
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

          configExtension(MaxLengthExtension, {
            disabled: false,
          }),

          configExtension(MarkdownShortcutsExtension, {
            transformers: MARKDOWN_TRANSFORMERS,
          }),

          ClearEditorExtension,

          EmojisExtension,
          DecoratorTextExtension,

          configExtension(ListExtension, {
            shouldPreserveNumbering: false,
            hasStrictIndent: false,
          }),

          CheckListExtension,
          HorizontalRuleExtension,

          ImagesExtension,
          DateTimeExtension,
          ChartsExtension,
        ],

        nodes: EDITOR_NODES,

        $initialEditorState(editor) {
          const {
            editorState: initialEditorState,
            editorSerializedState: initialSerializedState,
          } = initialStateRef.current;

          if (initialSerializedState) {
            const parsedEditorState = editor.parseEditorState(
              initialSerializedState,
            );

            editor.setEditorState(parsedEditorState);
            return;
          }

          if (initialEditorState) {
            editor.setEditorState(initialEditorState);
          }
        },
      }),
    [],
  );

  return (
    <div className={cn("bg-background/65 flex flex-col", className)}>
      <LexicalExtensionComposer
        extension={editorExtension}
        contentEditable={null}
      >
        <TooltipProvider>
          <div className="relative size-full">
            <ToolbarPlugin>
              {({ blockType }) => (
                <div className="vertical-align-middle sticky top-0 z-10 flex items-between justify-between gap-2 overflow-auto">
                  <div className="flex md:flex-row flex-wrap gap-1 items-center">
                    <HistoryToolbarPlugin />

                    <Separator orientation="vertical" className="h-7!" />

                    <BlockFormatDropDown>
                      <FormatParagraph />

                      <FormatHeading
                        levels={["h1", "h2", "h3", "h4", "h5", "h6"]}
                      />

                      <FormatNumberedList />
                      <FormatBulletedList />
                      <FormatCheckList />
                      <FormatCodeBlock />
                      <FormatQuote />
                    </BlockFormatDropDown>
                  </div>

                  {blockType === "code" ? (
                    <CodeLanguageToolbarPlugin />
                  ) : (
                    <>
                      <div className="flex flex-row gap-0.5">
                        <Separator orientation="vertical" className="h-7!" />

                        <FontFormatToolbarPlugin />

                        <Separator orientation="vertical" className="h-7!" />

                        <ClearFormattingToolbarPlugin />

                        <Separator orientation="vertical" className="h-7!" />
                      </div>
                      <ClearEditorActionPlugin />
                    </>
                  )}
                </div>
              )}
            </ToolbarPlugin>

            <div className="relative size-full">
              <div
                ref={onFloatingAnchorRef}
                className="overflow-y-scroll max-h-[calc(100%-5.5rem)] h-full scrollbar-custom scroll-fade"
              >
                <ContentEditable
                  placeholder={PLACEHOLDER}
                  className="p-4 size-full selection:bg-primary/50 selection:text-foreground"
                  placeholderClassName="top-4 left-4"
                />
              </div>

              <ComponentPickerMenuPlugin
                baseOptions={[
                  ParagraphPickerPlugin(),
                  HeadingPickerPlugin({ n: 1 }),
                  HeadingPickerPlugin({ n: 2 }),
                  HeadingPickerPlugin({ n: 3 }),
                  HeadingPickerPlugin({ n: 4 }),
                  HeadingPickerPlugin({ n: 5 }),
                  HeadingPickerPlugin({ n: 6 }),

                  TablePickerPlugin(),
                  CheckListPickerPlugin(),
                  NumberedListPickerPlugin(),
                  BulletedListPickerPlugin(),
                  QuotePickerPlugin(),
                  CodePickerPlugin(),
                  DividerPickerPlugin(),
                  ImagePickerPlugin(),
                  ChartPickerPlugin(),
                  DateTimePickerPlugin(),
                  DetailsPickerPlugin(),
                ]}
                dynamicOptionsFn={DynamicTablePickerPlugin}
              />

              <EmojiPickerPlugin />
              <AutoCompletePlugin />
              <ContextMenuPlugin />
              <SpecialTextPlugin />
              <TabFocusPlugin />
              <TabIndentationPlugin />
              <CodeHighlightPlugin />
              <DetailsEscapePlugin />
              <TablePlugin />

              <DraggableBlockPlugin
                anchorElem={floatingAnchorElem}
                baseOptions={[
                  ParagraphPickerPlugin(),
                  HeadingPickerPlugin({ n: 1 }),
                  HeadingPickerPlugin({ n: 2 }),
                  HeadingPickerPlugin({ n: 3 }),
                  HeadingPickerPlugin({ n: 4 }),
                  HeadingPickerPlugin({ n: 5 }),
                  HeadingPickerPlugin({ n: 6 }),

                  TablePickerPlugin(),
                  DetailsPickerPlugin(),
                  CheckListPickerPlugin(),
                  NumberedListPickerPlugin(),
                  BulletedListPickerPlugin(),
                  QuotePickerPlugin(),
                  CodePickerPlugin(),
                  DividerPickerPlugin(),
                  ImagePickerPlugin(),
                  ChartPickerPlugin(),
                  DateTimePickerPlugin(),
                ]}
                dynamicOptionsFn={DynamicTablePickerPlugin}
              />

              <FloatingTextFormatToolbarPlugin
                anchorElem={floatingAnchorElem}
                setIsLinkEditMode={setIsLinkEditMode}
              />

              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />

              <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            </div>

            <div className="absolute bottom-0 w-full flex items-center justify-between p-1 pl-2">
              <CounterCharacterPlugin charset="UTF-16" />
              <div className="flex-1 items-center justify-end flex text-xs">
                <ToggleViewer />
                <MarkdownTogglePlugin
                  id="markdown-mode-footer"
                  shouldPreserveNewLinesInMarkdown
                  transformers={MARKDOWN_TRANSFORMERS}
                />
                <UrlClientDocumentSyncPlugin
                  initialMarkdown={initialMarkdown}
                  transformers={MARKDOWN_TRANSFORMERS}
                  shouldPreserveNewLinesInMarkdown
                  debounceMs={2_500}
                  scrollContainerRef={scrollContainerRef}
                />
              </div>
            </div>
          </div>

          <OnChangePlugin
            ignoreSelectionChange
            onChange={(nextEditorState) => {
              onChange?.(nextEditorState);
              onSerializedChange?.(nextEditorState.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalExtensionComposer>
    </div>
  );
}
