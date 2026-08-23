import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import { type JSX, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEditorModal } from "@/components/use-modal";
import { cn } from "@/lib/utils";

import type { ComponentPickerOption } from "../../component-picker-option";

const EMPTY_OPTIONS: ComponentPickerOption[] = [];

function ComponentPickerMenu({
  options,
  selectedIndex,
  selectOptionAndCleanUp,
  setHighlightedIndex,
}: {
  options: Array<ComponentPickerOption>;
  selectedIndex: number | null;
  selectOptionAndCleanUp: (option: ComponentPickerOption) => void;
  setHighlightedIndex: (index: number) => void;
}) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    itemRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }, [selectedIndex]);

  return (
    <div className="bg-popover text-popover-foreground absolute h-min min-w-48 rounded-md border shadow-md">
      <Command
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();

            setHighlightedIndex(
              selectedIndex !== null
                ? (selectedIndex - 1 + options.length) % options.length
                : options.length - 1,
            );
          } else if (event.key === "ArrowDown") {
            event.preventDefault();

            setHighlightedIndex(
              selectedIndex !== null ? (selectedIndex + 1) % options.length : 0,
            );
          }
        }}
      >
        <CommandList className="w-56">
          <CommandGroup>
            {options.map((option, index) => (
              <CommandItem
                key={option.key}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                value={option.title}
                onSelect={() => {
                  selectOptionAndCleanUp(option);
                }}
                className={cn(
                  "flex items-center gap-2",
                  selectedIndex === index
                    ? "bg-accent text-accent-foreground"
                    : "bg-transparent!",
                )}
              >
                {option.icon}
                {option.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

export function ComponentPickerMenuPlugin({
  baseOptions = EMPTY_OPTIONS,
  dynamicOptionsFn,
}: {
  baseOptions?: Array<ComponentPickerOption>;
  dynamicOptionsFn?: ({
    queryString,
  }: {
    queryString: string;
  }) => Array<ComponentPickerOption>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useEditorModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  let options = baseOptions;

  if (queryString) {
    const regex = new RegExp(queryString, "i");

    options = [
      ...(dynamicOptionsFn?.({ queryString }) ?? []),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }

  function onSelectOption(
    selectedOption: ComponentPickerOption,
    nodeToRemove: TextNode | null,
    closeMenu: () => void,
    matchingString: string,
  ) {
    editor.update(() => {
      nodeToRemove?.remove();

      selectedOption.onSelect(matchingString, editor, showModal);

      closeMenu();
    });
  }

  return (
    <>
      {modal}

      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) =>
          anchorElementRef.current && options.length > 0
            ? createPortal(
                <ComponentPickerMenu
                  options={options}
                  selectedIndex={selectedIndex}
                  selectOptionAndCleanUp={selectOptionAndCleanUp}
                  setHighlightedIndex={setHighlightedIndex}
                />,
                anchorElementRef.current,
              )
            : null
        }
      />
    </>
  );
}
