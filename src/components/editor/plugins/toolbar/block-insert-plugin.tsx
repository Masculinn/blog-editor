import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorModal } from "@/components/use-modal";

export function BlockInsertPlugin({ children }: { children: React.ReactNode }) {
  const [modal] = useEditorModal();

  return (
    <>
      {modal}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" className="gap-1 px-2" />}
        >
          <PlusIcon className="size-4" />
          <span className="text-sm">Insert</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit">{children}</DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
