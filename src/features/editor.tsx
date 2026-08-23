"use client";

import { CodeExtension } from "@lexical/code";
import {
  AutoFocusExtension,
  ClearEditorExtension,
  DecoratorTextExtension,
  HorizontalRuleExtension,
  SelectionAlwaysOnDisplayExtension,
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
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
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
import { useCallback, useMemo, useRef, useState } from "react";

import { ContentEditable } from "@/components/content-editable";

import { AutoLinkExtension } from "@/components/editor/extensions/auto-link-extension";
import { DateTimeExtension } from "@/components/editor/extensions/date-time-extension";
import { EmojisExtension } from "@/components/editor/extensions/emojis-extension";
import { ImagesExtension } from "@/components/editor/extensions/images-extension";
import { MarkdownShortcutsExtension } from "@/components/editor/extensions/markdown-shortcuts-extension";
import { MaxLengthExtension } from "@/components/editor/extensions/max-length-extension";

import { AutocompleteNode } from "@/components/editor/nodes/autocomplete-node";
import { EmojiNode } from "@/components/editor/nodes/emoji-node";
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node";
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node";
import { MentionNode } from "@/components/editor/nodes/mention-node";
import { SpecialTextNode } from "@/components/editor/nodes/special-text-node";

import { ActionsPlugin } from "@/components/editor/plugins/actions/actions-plugin";
import { ClearEditorActionPlugin } from "@/components/editor/plugins/actions/clear-editor-plugin";
import { CounterCharacterPlugin } from "@/components/editor/plugins/actions/counter-character-plugin";
import { EditModeTogglePlugin } from "@/components/editor/plugins/actions/edit-mode-toggle-plugin";
import { ImportExportPlugin } from "@/components/editor/plugins/actions/import-export-plugin";
import { MarkdownTogglePlugin } from "@/components/editor/plugins/actions/markdown-toggle-plugin";
import { ShareContentPlugin } from "@/components/editor/plugins/actions/share-content-plugin";
import { TreeViewPlugin } from "@/components/editor/plugins/actions/tree-view-plugin";

import { AutoCompletePlugin } from "@/components/editor/plugins/auto-complete-plugin";
import { CodeActionMenuPlugin } from "@/components/editor/plugins/code-action-menu-plugin";
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin";
import { ComponentPickerMenuPlugin } from "@/components/editor/plugins/component-picker-menu-plugin";
import { ContextMenuPlugin } from "@/components/editor/plugins/context-menu-plugin";
import { DraggableBlockPlugin } from "@/components/editor/plugins/draggable-block-plugin";
import { EmojiPickerPlugin } from "@/components/editor/plugins/emoji-picker-plugin";
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/plugins/floating-text-format-plugin";
import { LayoutPlugin } from "@/components/editor/plugins/layout-plugin";

import { AlignmentPickerPlugin } from "@/components/editor/plugins/picker/alignment-picker-plugin";
import { BulletedListPickerPlugin } from "@/components/editor/plugins/picker/bulleted-list-picker-plugin";
import { CheckListPickerPlugin } from "@/components/editor/plugins/picker/check-list-picker-plugin";
import { CodePickerPlugin } from "@/components/editor/plugins/picker/code-picker-plugin";
import { ColumnsLayoutPickerPlugin } from "@/components/editor/plugins/picker/columns-layout-picker-plugin";
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
import { InsertColumnsLayout } from "@/components/editor/plugins/toolbar/block-insert/insert-columns-layout";
import { InsertHorizontalRule } from "@/components/editor/plugins/toolbar/block-insert/insert-horizontal-rule";
import { InsertImage } from "@/components/editor/plugins/toolbar/block-insert/insert-image";
import { InsertTable } from "@/components/editor/plugins/toolbar/block-insert/insert-table";

import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin";
import { CodeLanguageToolbarPlugin } from "@/components/editor/plugins/toolbar/code-language-toolbar-plugin";
import { ElementFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin";
import { FontBackgroundToolbarPlugin } from "@/components/editor/plugins/toolbar/font-background-toolbar-plugin";
import { FontColorToolbarPlugin } from "@/components/editor/plugins/toolbar/font-color-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "@/components/editor/plugins/toolbar/font-family-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { FontSizeToolbarPlugin } from "@/components/editor/plugins/toolbar/font-size-toolbar-plugin";
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin";
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin";
import { SubSuperToolbarPlugin } from "@/components/editor/plugins/toolbar/subsuper-toolbar-plugin";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";

import { editorTheme } from "@/components/editor/themes/editor-theme";

import { EMOJI } from "@/components/editor/transformers/markdown-emoji-transformer";
import { HR } from "@/components/editor/transformers/markdown-hr-transformer";
import { IMAGE } from "@/components/editor/transformers/markdown-image-transformer";
import { TABLE } from "@/components/editor/transformers/markdown-table-transformer";

import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

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
  MentionNode,
  AutocompleteNode,
  SpecialTextNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LayoutContainerNode,
  LayoutItemNode,
];

type EditorProps = {
  /**
   * Initial Lexical EditorState.
   *
   * This is treated as INITIAL state, not as a controlled value.
   */
  editorState?: EditorState;

  /**
   * Initial serialized Lexical state.
   *
   * Takes precedence over `editorState` when both are provided.
   */
  editorSerializedState?: SerializedEditorState;

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
}: EditorProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  /**
   * IMPORTANT:
   *
   * LexicalExtensionComposer expects the supplied extension to remain
   * stable for the lifetime of this editor.
   *
   * Therefore we intentionally snapshot the initial-state props once.
   *
   * If the parent needs to load an entirely different document later,
   * remount this Editor with a different React `key`, or add a dedicated
   * state-synchronization plugin.
   */
  const initialStateRef = useRef({
    editorState,
    editorSerializedState,
  });

  /**
   * The callback ref itself must also remain stable.
   *
   * Otherwise React can detach/re-attach a callback ref when its function
   * identity changes between renders.
   */
  const onFloatingAnchorRef = useCallback((element: HTMLDivElement | null) => {
    setFloatingAnchorElem(element);
  }, []);

  /**
   * Semantic memoization.
   *
   * This isn't just a render optimization. LexicalExtensionComposer uses
   * the extension identity when creating the editor. Recreating this
   * extension can result in a new Lexical editor instance.
   */
  const editorExtension = useMemo(
    () =>
      defineExtension({
        name: "@shadcn-editor",
        namespace: "Playground",

        theme: editorTheme,

        dependencies: [
          RichTextExtension,

          AutoFocusExtension,
          SelectionAlwaysOnDisplayExtension,

          HistoryExtension,

          /**
           * Lexical >= 0.45 moved code-block runtime behavior into
           * CodeExtension.
           *
           * It also registers CodeNode and CodeHighlightNode.
           */
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

          /**
           * Serialized state wins if both props were supplied.
           */
          if (initialSerializedState) {
            const parsedEditorState = editor.parseEditorState(
              initialSerializedState,
            );

            /**
             * parseEditorState() only PARSES.
             *
             * It does not install the resulting EditorState automatically.
             */
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
        "bg-background w-full overflow-hidden rounded-lg border shadow",
        className,
      )}
    >
      <LexicalExtensionComposer
        extension={editorExtension}
        contentEditable={null}
      >
        <TooltipProvider>
          <div className="relative">
            <ToolbarPlugin>
              {({ blockType }) => (
                <div className="vertical-align-middle sticky top-0 z-10 flex items-center gap-2 overflow-auto border-b p-1">
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

                  {blockType === "code" ? (
                    <CodeLanguageToolbarPlugin />
                  ) : (
                    <>
                      <FontFamilyToolbarPlugin />

                      <Separator orientation="vertical" className="h-7!" />

                      <FontSizeToolbarPlugin />
                      <FontFormatToolbarPlugin />
                      <SubSuperToolbarPlugin />

                      <LinkToolbarPlugin
                        setIsLinkEditMode={setIsLinkEditMode}
                      />

                      <ClearFormattingToolbarPlugin />

                      <FontColorToolbarPlugin />
                      <FontBackgroundToolbarPlugin />

                      <ElementFormatToolbarPlugin />

                      <BlockInsertPlugin>
                        <InsertHorizontalRule />
                        <InsertImage />
                        <InsertTable />
                        <InsertColumnsLayout />
                      </BlockInsertPlugin>
                    </>
                  )}
                </div>
              )}
            </ToolbarPlugin>

            <div className="relative">
              <div ref={onFloatingAnchorRef}>
                <ContentEditable
                  placeholder={PLACEHOLDER}
                  className="h-[calc(100vh-141px)] pl-4"
                />
              </div>

              <ComponentPickerMenuPlugin
                baseOptions={[
                  ParagraphPickerPlugin(),

                  HeadingPickerPlugin({ n: 1 }),
                  HeadingPickerPlugin({ n: 2 }),
                  HeadingPickerPlugin({ n: 3 }),

                  TablePickerPlugin(),

                  CheckListPickerPlugin(),
                  NumberedListPickerPlugin(),
                  BulletedListPickerPlugin(),

                  QuotePickerPlugin(),
                  CodePickerPlugin(),
                  DividerPickerPlugin(),
                  ImagePickerPlugin(),
                  ColumnsLayoutPickerPlugin(),
                  DateTimePickerPlugin(),

                  AlignmentPickerPlugin({
                    alignment: "left",
                  }),

                  AlignmentPickerPlugin({
                    alignment: "center",
                  }),

                  AlignmentPickerPlugin({
                    alignment: "right",
                  }),

                  AlignmentPickerPlugin({
                    alignment: "justify",
                  }),
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

              <TablePlugin />

              <LayoutPlugin />

              <DraggableBlockPlugin
                anchorElem={floatingAnchorElem}
                baseOptions={[
                  ParagraphPickerPlugin(),

                  HeadingPickerPlugin({ n: 1 }),
                  HeadingPickerPlugin({ n: 2 }),
                  HeadingPickerPlugin({ n: 3 }),

                  TablePickerPlugin(),

                  CheckListPickerPlugin(),
                  NumberedListPickerPlugin(),
                  BulletedListPickerPlugin(),

                  QuotePickerPlugin(),
                  CodePickerPlugin(),
                  DividerPickerPlugin(),
                  ImagePickerPlugin(),
                  ColumnsLayoutPickerPlugin(),
                  DateTimePickerPlugin(),

                  AlignmentPickerPlugin({
                    alignment: "left",
                  }),

                  AlignmentPickerPlugin({
                    alignment: "center",
                  }),

                  AlignmentPickerPlugin({
                    alignment: "right",
                  }),

                  AlignmentPickerPlugin({
                    alignment: "justify",
                  }),
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

            <ActionsPlugin>
              <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
                <div className="flex flex-1 justify-start text-xs text-gray-500">
                  <CharacterLimitPlugin
                    maxLength={MAX_LENGTH}
                    charset="UTF-16"
                  />
                </div>

                <div>
                  <CounterCharacterPlugin charset="UTF-16" />
                </div>

                <div className="flex flex-1 justify-end">
                  <ShareContentPlugin />

                  <ImportExportPlugin />

                  <MarkdownTogglePlugin
                    shouldPreserveNewLinesInMarkdown
                    transformers={MARKDOWN_TRANSFORMERS}
                  />

                  <EditModeTogglePlugin />

                  <ClearEditorActionPlugin />

                  <TreeViewPlugin />
                </div>
              </div>
            </ActionsPlugin>
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
