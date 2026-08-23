import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorModal } from "@/components/use-modal";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";

export function BlockInsertPlugin({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [modal] = useEditorModal();

  return (
    <>
      {modal}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-1 px-2", className)}
            />
          }
        >
          <PlusIcon className="size-4" />
          <span className="text-sm">Insert</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit">{children}</DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
