import { Badge } from "@/components/ui/badge";
import type { JSX } from "react";

type MdCodeProps = JSX.IntrinsicElements["code"];

export const MdCode = (props: MdCodeProps) => (
  <Badge variant="outline" className="font-secondary text-sm" {...props} />
);
