import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import {
  CheckCheck,
  CircleAlert,
  CircleX,
  Info,
  type LucideProps,
} from "lucide-react";
import type React from "react";
import type { JSX } from "react";

const ALERT_TYPES = ["info", "success", "warning", "error"] as const;
type AlertType = (typeof ALERT_TYPES)[number];

type BlockquoteProps = JSX.IntrinsicElements["blockquote"] & {
  id?: string;
};

type VariantProps = Record<AlertType, string>;

const blockquoteVariants = cva(
  "border-l-2 my-8 flex gap-3 flex-row items-center p-4 rounded-r-xl relative overflow-hidden z-50",
  {
    variants: {
      variant: {
        success: "dark:border-l-emerald-600 border-l-emerald-400",
        info: "dark:border-l-sky-600 border-l-sky-400",
        error: "dark:border-l-rose-600 border-l-rose-400",
        warning: "dark:border-l-amber-600 border-l-amber-400",
      } as const satisfies VariantProps,
    },
  },
);

const motionBlurVariants = cva(
  "absolute size-24 bg-linear-to-r blur-3xl -z-20 to-transparent",
  {
    variants: {
      variant: {
        success: "from-emerald-400/50",
        info: "from-sky-400/50",
        error: "from-rose-400/50",
        warning: "from-amber-400/50",
      } as const satisfies VariantProps,
    },
  },
);

const iconVariants = cva("size-5 shrink-0 mt-2 self-start z-30", {
  variants: {
    variant: {
      success: "text-emerald-400",
      info: "text-sky-400",
      error: "text-rose-400",
      warning: "text-amber-400",
    } as const satisfies VariantProps,
  },
});

function isAlertType(v: unknown): v is AlertType {
  return (
    typeof v === "string" && (ALERT_TYPES as readonly string[]).includes(v)
  );
}

const getIcon = (id: AlertType): React.ComponentType<LucideProps> | null => {
  switch (id) {
    case "success":
      return CheckCheck;
    case "info":
      return Info;
    case "error":
      return CircleX;
    case "warning":
      return CircleAlert;
    default:
      return null;
  }
};

export const MdBlockquote = (props: BlockquoteProps) => {
  const { id: idProp, className, children, ...rest } = props;

  const variant = isAlertType(idProp) ? idProp : undefined;

  if (!variant) {
    return (
      <blockquote id={idProp} className={className} {...rest}>
        {children}
      </blockquote>
    );
  }

  const Icon = getIcon(variant);

  return (
    <blockquote
      className={cn(blockquoteVariants({ variant }), className)}
      {...rest}
    >
      {Icon && <Icon className={iconVariants({ variant })} />}
      {children}
      <div className={cn(motionBlurVariants({ variant }))} />
    </blockquote>
  );
};
