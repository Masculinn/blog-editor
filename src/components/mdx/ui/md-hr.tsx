import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SeparatorProps } from "@base-ui/react";
import type { FC } from "react";

export const MdHr: FC<SeparatorProps> = (props) => (
  <Separator
    orientation="horizontal"
    className={cn("my-4", props.className)}
    {...props}
  />
);
