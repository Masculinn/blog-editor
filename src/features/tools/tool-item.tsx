"use client";

import { useModalTrigger } from "@/components/modal";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTools } from "@/providers/tools-provider";
import type { ComponentProps } from "react";
import type { Tool } from "../../types/tools.types";

type Props = Omit<Tool, "Component"> & {
  onSelect?: ComponentProps<typeof CommandItem>["onSelect"];
};

export function ToolItem({ id, accent, img, title, onSelect }: Props) {
  const { setOpen: setToolsOpen } = useTools();

  const { open: modalOpen, openModal } = useModalTrigger();

  const handleSelect: ComponentProps<typeof CommandItem>["onSelect"] = (
    value,
  ) => {
    onSelect?.(value);

    openModal();
    setToolsOpen(false);
  };

  return (
    <CommandItem
      value={`${id} ${title}`}
      onSelect={handleSelect}
      aria-haspopup="dialog"
      aria-expanded={modalOpen}
      className={cn(
        "group cursor-pointer",
        "outline-none",

        // Mouse interaction.
        accent.surface,

        // Actual DOM keyboard focus.
        accent.focus,

        // cmdk ArrowUp / ArrowDown selection.
        accent.selected,
      )}
    >
      <span
        aria-hidden="true"
        style={{
          backgroundImage: `url("${img}")`,
        }}
        className={cn(
          "relative z-10 size-12 shrink-0 rounded-full",
          "border border-white/10",
          "bg-cover bg-center bg-no-repeat",
          "ring-1 ring-black/10",

          "transition-all duration-300 ease-out",

          "group-hover:saturate-200",
          "group-hover:shadow-lg",

          "group-focus-visible:saturate-200",
          "group-focus-visible:hue-rotate-30",
          "group-focus-visible:shadow-lg",

          // Arrow-key selected CommandItem.
          "group-data-[selected=true]:saturate-200",
          "group-data-[selected=true]:hue-rotate-30",
          "group-data-[selected=true]:shadow-lg",

          "motion-reduce:transform-none",
          "motion-reduce:transition-none",

          accent.border,
          accent.shadow,
        )}
      />

      <span
        className={cn(
          "relative z-10 max-w-full rounded-md py-1",

          "text-center text-md font-medium tracking-tight",
          "text-foreground/70",

          "transition-[color,transform] duration-200",

          "group-active:translate-y-px",

          "motion-reduce:transform-none",
          "motion-reduce:transition-none",

          accent.text,
        )}
      >
        {title}
      </span>
    </CommandItem>
  );
}
