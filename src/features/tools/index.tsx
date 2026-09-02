import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import data from "@/constants/tools.data";
import ToolsProvider from "@/providers/tools-provider";
import { ToolItem } from "./tool-item";

export function Tools({ className }: { className?: string }) {
  return (
    <ToolsProvider>
      <Command className={className}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {data.map(({ Component, ...tool }) => (
              <Component
                key={tool.id}
                title={tool.title}
                render={<ToolItem {...tool} />}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </ToolsProvider>
  );
}
