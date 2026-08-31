import { cn } from "@/lib/utils";
import type { FC } from "react";

type MdListProps = React.HTMLAttributes<HTMLLIElement>;
type MdULProps = React.HTMLAttributes<HTMLUListElement>;
type MdOLProps = React.HTMLAttributes<HTMLOListElement>;

export const MdList: FC<MdListProps> = ({ className, ...props }) => (
  <li className={className} {...props} />
);

export const MdUl: FC<MdULProps> = ({ className, ...props }) => (
  <ul className={cn("mdx-ul text-blog-muted", className)} {...props} />
);

export const MdOl: FC<MdOLProps> = ({ className, ...props }) => (
  <ol className={cn("mdx-ol marker:text-blog-muted", className)} {...props} />
);

export default MdList;
