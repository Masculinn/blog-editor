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
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import { OverflowNode } from "@lexical/overflow";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { RichTextExtension } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import {
  configExtension,
  defineExtension,
  type EditorState,
  type SerializedEditorState,
} from "lexical";
import { useMemo, useRef, useState } from "react";

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
import { ShareContentPlugin } from "@/components/editor/plugins/actions/share-content-plugin";

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

import { BlockInsertPlugin } from "@/components/editor/plugins/toolbar/block-insert-plugin";
import { InsertHorizontalRule } from "@/components/editor/plugins/toolbar/block-insert/insert-horizontal-rule";
import { InsertImage } from "@/components/editor/plugins/toolbar/block-insert/insert-image";
import { InsertTable } from "@/components/editor/plugins/toolbar/block-insert/insert-table";

import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { CodeLanguageToolbarPlugin } from "@/components/editor/plugins/toolbar/code-language-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin";
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";

import { editorTheme } from "@/components/editor/themes/editor-theme";

import { EMOJI } from "@/components/editor/transformers/markdown-emoji-transformer";
import { HR } from "@/components/editor/transformers/markdown-hr-transformer";
import { IMAGE } from "@/components/editor/transformers/markdown-image-transformer";
import { TABLE } from "@/components/editor/transformers/markdown-table-transformer";

import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

import { DisableDragDropExtension } from "@/components/editor/extensions/disable-drag-drop-extension";
import { AutoCompletePlugin } from "@/components/editor/plugins/auto-complete-plugin";
import { UrlDocumentSyncPlugin } from "@/components/editor/plugins/url-document-sync-plugin";
import { cn } from "@/lib/utils";
import { validateUrl } from "@/utils/editor/validateUrl";

const PLACEHOLDER = "Press / for commands...";
const MAX_LENGTH = Infinity;

const MARKDOWN_TRANSFORMERS = [
  TABLE,
  HR,
  IMAGE,
  EMOJI,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];

const EDITOR_NODES = [
  OverflowNode,
  EmojiNode,
  SpecialTextNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LayoutContainerNode,
  LayoutItemNode,
];

type EditorProps = {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  documentHash?: string | null;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  className?: string;
};

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  className,
  documentHash,
}: EditorProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const initialStateRef = useRef({
    editorState,
    editorSerializedState,
  });

  const onFloatingAnchorRef = (element: HTMLDivElement | null) => {
    setFloatingAnchorElem(element);
  };

  const editorExtension = useMemo(
    () =>
      defineExtension({
        name: "burakdev-blog-editor",
        namespace: "Editor",
        theme: editorTheme,
        dependencies: [
          RichTextExtension,
          AutoFocusExtension,
          HistoryExtension,
          CodeExtension,
          DisableDragDropExtension,
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
            maxLength: MAX_LENGTH,
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
    <div
      className={cn(
        "bg-background/65 size-full rounded-lg border shadow flex flex-col",
        className,
      )}
    >
      <LexicalExtensionComposer
        extension={editorExtension}
        contentEditable={null}
      >
        <TooltipProvider>
          <div className="relative size-full">
            <ToolbarPlugin>
              {({ blockType }) => (
                <div className="vertical-align-middle sticky top-0 z-10 flex items-between justify-between gap-2 overflow-auto border-b p-1">
                  <div className="flex flex-row gap-1">
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
                    <>
                      <CodeLanguageToolbarPlugin />
                      <MarkdownTogglePlugin
                        shouldPreserveNewLinesInMarkdown
                        transformers={MARKDOWN_TRANSFORMERS}
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row gap-0.5">
                        <Separator orientation="vertical" className="h-7!" />
                        <FontFormatToolbarPlugin />
                        <Separator orientation="vertical" className="h-7!" />
                        <LinkToolbarPlugin
                          setIsLinkEditMode={setIsLinkEditMode}
                        />
                        <ClearFormattingToolbarPlugin />
                        <Separator orientation="vertical" className="h-7!" />
                      </div>
                      <div className="flex flex-row gap-0.5">
                        <ShareContentPlugin />
                        <ClearEditorActionPlugin />

                        <BlockInsertPlugin>
                          <InsertHorizontalRule />
                          <InsertImage />
                          <InsertTable />
                        </BlockInsertPlugin>
                        <MarkdownTogglePlugin
                          shouldPreserveNewLinesInMarkdown
                          transformers={MARKDOWN_TRANSFORMERS}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </ToolbarPlugin>

            <div className="relative size-full w-full">
              <div
                ref={onFloatingAnchorRef}
                className="overflow-y-scroll max-h-[calc(100%-5.5rem)] h-full scrollbar-custom scroll-fade"
              >
                <ContentEditable
                  placeholder={PLACEHOLDER}
                  className="p-4 size-full selection:bg-primary selection:text-primary-foreground"
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
                  DateTimePickerPlugin(),
                ]}
                dynamicOptionsFn={DynamicTablePickerPlugin}
              />
              <UrlDocumentSyncPlugin documentHash={documentHash} />{" "}
              <EmojiPickerPlugin />
              <AutoCompletePlugin />
              <ContextMenuPlugin />
              <SpecialTextPlugin />
              <TabFocusPlugin />
              <TabIndentationPlugin />
              <CodeHighlightPlugin />
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

                  CheckListPickerPlugin(),
                  NumberedListPickerPlugin(),
                  BulletedListPickerPlugin(),

                  QuotePickerPlugin(),
                  CodePickerPlugin(),
                  DividerPickerPlugin(),
                  ImagePickerPlugin(),
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
            <div className="absolute bottom-0  w-full flex items-center justify-between border-t p-1">
              <CounterCharacterPlugin charset="UTF-16" />
              {/* <div className="flex flex-1 justify-start text-xs text-gray-500">
                <CharacterLimitPlugin maxLength={MAX_LENGTH} charset="UTF-16" />
              </div> */}
              <div className="flex flex-1 justify-end">
                {/* <ImportExportPlugin /> */}
                {/* <EditModeTogglePlugin /> */}
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
