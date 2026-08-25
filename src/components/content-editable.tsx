import { getAnimation } from "@/lib/motion/getAnimation";
import { cn } from "@/lib/utils";
import { MotionText } from "@/motion/components/motion-text";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import type { JSX } from "react";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={cn(
        "ContentEditable__root relative focus:outline-none",
        className,
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={cn(
            "text-muted-foreground pointer-events-none absolute text-ellipsis select-none",
            placeholderClassName,
          )}
        >
          <MotionText {...getAnimation("contentEditablePlaceholder")}>
            {placeholder}
          </MotionText>
        </div>
      }
      tabIndex={0}
    />
  );
}
