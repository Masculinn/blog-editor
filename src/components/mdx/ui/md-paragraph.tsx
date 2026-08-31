import { cn } from "@/lib/utils";
import type { FC } from "react";

type MdParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;

export const MdParagraph: FC<MdParagraphProps> = ({ className, ...props }) => (
  <p
    className={cn(
      "py-4 text-blog-muted tracking-tight text-[1.15rem]",
      className,
    )}
    {...props}
  />
);
