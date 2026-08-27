import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { Badge } from "../ui/badge";

type PingProps = {
  mode: VariantProps<typeof Badge>["variant"];
  size: "sm" | "md" | "lg";
  className?: string;
  isAnimated?: boolean;
};

export default function Ping(props: PingProps) {
  const { isAnimated = false, mode, size, className } = props;

  const elSize = size === "sm" ? "size-3" : size === "md" ? "size-4" : "size-5";

  const modeClass =
    mode === "success"
      ? "bg-green-400"
      : mode === "destructive"
        ? "bg-red-400"
        : "bg-amber-500";

  return (
    <span
      className={cn(
        "inline-flex rounded-full",
        isAnimated && "animate-pulse",
        elSize,
        modeClass,
        className,
      )}
    />
  );
}
