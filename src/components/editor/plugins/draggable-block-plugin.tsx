import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEditorModal } from "@/components/use-modal";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $isParagraphNode,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
  mergeRegister,
  type NodeKey,
} from "lexical";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import {
  type JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as ReactDOM from "react-dom";

import type { ComponentPickerOption } from "../../component-picker-option";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

type PickerState = {
  insertBefore: boolean;
  targetNodeKey: NodeKey;
};

function isOnMenu(element: HTMLElement): boolean {
  return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

function isFileDrag(event: DragEvent): boolean {
  const dataTransfer = event.dataTransfer;

  if (!dataTransfer) {
    return false;
  }

  return (
    dataTransfer.files.length > 0 ||
    Array.from(dataTransfer.types).includes("Files")
  );
}

export function DraggableBlockPlugin({
  anchorElem,
  baseOptions = [],
  dynamicOptionsFn,
}: {
  anchorElem: HTMLElement | null;
  baseOptions?: Array<ComponentPickerOption>;
  dynamicOptionsFn?: ({
    queryString,
  }: {
    queryString: string;
  }) => Array<ComponentPickerOption>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();

  const menuRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);

  const [draggableElement, setDraggableElement] = useState<HTMLElement | null>(
    null,
  );

  const [pickerState, setPickerState] = useState<PickerState | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [queryString, setQueryString] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const [pickerPosition, setPickerPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  /*
   * Block only external/file drops.
   *
   * Do NOT globally disable DRAGOVER_COMMAND / DROP_COMMAND because
   * LexicalDraggableBlockPlugin uses those commands to reorder blocks.
   */
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        DRAGOVER_COMMAND,
        (event) => {
          if (!isFileDrag(event)) {
            return false;
          }

          event.preventDefault();

          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "none";
          }

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),

      editor.registerCommand(
        DROP_COMMAND,
        (event) => {
          if (!isFileDrag(event)) {
            return false;
          }

          event.preventDefault();
          event.stopPropagation();

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  const options = useMemo(() => {
    if (!queryString) {
      return baseOptions;
    }

    let regex: RegExp;

    try {
      regex = new RegExp(queryString, "i");
    } catch {
      return baseOptions;
    }

    return [
      ...(dynamicOptionsFn?.({ queryString }) ?? []),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }, [baseOptions, dynamicOptionsFn, queryString]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    setHighlightedIndex((current) =>
      Math.min(current, Math.max(options.length - 1, 0)),
    );
  }, [isPickerOpen, options.length]);

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (
        pickerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsPickerOpen(false);
      setPickerState(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPickerOpen]);

  const selectOption = useCallback(
    (option: ComponentPickerOption) => {
      if (!pickerState) {
        setIsPickerOpen(false);
        return;
      }

      setIsPickerOpen(false);

      editor.update(() => {
        const node = $getNodeByKey(pickerState.targetNodeKey);

        if (!node) {
          return;
        }

        const placeholder = $createParagraphNode();
        const textNode = $createTextNode("");

        placeholder.append(textNode);

        if (pickerState.insertBefore) {
          node.insertBefore(placeholder);
        } else {
          node.insertAfter(placeholder);
        }

        textNode.select();

        option.onSelect(queryString, editor, showModal);

        const latestPlaceholder = placeholder.getLatest();

        if (!$isParagraphNode(latestPlaceholder)) {
          return;
        }

        const onlyChild = latestPlaceholder.getFirstChild();

        if (
          $isTextNode(onlyChild) &&
          onlyChild.getTextContent().length === 0 &&
          latestPlaceholder.getChildrenSize() === 1
        ) {
          latestPlaceholder.remove();
        }
      });

      setPickerState(null);
      setQueryString("");
    },
    [editor, pickerState, queryString, showModal],
  );

  useEffect(() => {
    if (!isPickerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();

        setIsPickerOpen(false);
        setPickerState(null);

        return;
      }

      if (!options.length) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setHighlightedIndex((index) =>
          index + 1 >= options.length ? 0 : index + 1,
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setHighlightedIndex((index) =>
          index - 1 < 0 ? options.length - 1 : index - 1,
        );

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const option = options[highlightedIndex];

        if (option) {
          selectOption(option);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightedIndex, isPickerOpen, options, selectOption]);

  const openComponentPicker = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!draggableElement) {
        return;
      }

      let targetNodeKey: NodeKey | null = null;

      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(draggableElement);

        if (node) {
          targetNodeKey = node.getKey();
        }
      });

      if (!targetNodeKey) {
        return;
      }

      const insertBefore = event.altKey || event.ctrlKey;
      const rect = menuRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setPickerPosition({
        left: rect.right + window.scrollX + 8,
        top: rect.top + window.scrollY,
      });

      setPickerState({
        insertBefore,
        targetNodeKey,
      });

      setQueryString("");
      setHighlightedIndex(0);
      setIsPickerOpen(true);
    },
    [draggableElement, editor],
  );

  if (!anchorElem) {
    return null;
  }

  return (
    <>
      {modal}

      {isPickerOpen && pickerPosition
        ? ReactDOM.createPortal(
            <div
              ref={pickerRef}
              className="absolute z-9999 w-56 rounded-md shadow-md"
              style={{
                left: pickerPosition.left,
                top: pickerPosition.top,
              }}
            >
              <Command>
                <CommandInput
                  placeholder="Filter blocks..."
                  value={queryString}
                  onValueChange={setQueryString}
                />

                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>

                  <CommandGroup>
                    {options.map((option, index) => (
                      <CommandItem
                        key={option.key}
                        value={option.title}
                        onSelect={() => {
                          setHighlightedIndex(index);
                          selectOption(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(index);
                        }}
                        className={`flex items-center gap-2 ${
                          highlightedIndex === index
                            ? "bg-accent"
                            : "bg-transparent!"
                        }`}
                      >
                        {option.icon}
                        {option.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>,
            document.body,
          )
        : null}

      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef as React.RefObject<HTMLDivElement>}
        targetLineRef={targetLineRef as React.RefObject<HTMLDivElement>}
        menuComponent={
          <div
            ref={menuRef}
            className={`${DRAGGABLE_BLOCK_MENU_CLASSNAME} absolute top-0 right-0 flex items-center opacity-0 will-change-transform`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              title="Click to add below (Alt/Ctrl: add above)"
              className="cursor-pointer rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={openComponentPicker}
            >
              <PlusIcon />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              title="Drag to reorder block"
              className="cursor-grab rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
              tabIndex={-1}
            >
              <GripVerticalIcon className="opacity-60" />
            </Button>
          </div>
        }
        targetLineComponent={
          <div
            ref={targetLineRef}
            className="pointer-events-none absolute top-0 left-0 h-0.5 bg-primary opacity-0 will-change-transform"
          />
        }
        isOnMenu={isOnMenu}
        onElementChanged={setDraggableElement}
      />
    </>
  );
}
