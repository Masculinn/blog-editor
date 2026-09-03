"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { VariantProps } from "class-variance-authority";
import { Check, Copy } from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, type buttonVariants } from "../ui/button";

interface Props {
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  data: string;
  withToast?: boolean;
}

export const CopyCode: FC<Props> = ({
  className,
  variant,
  data,
  withToast,
}) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick() {
    if (copied) return;

    copyToClipboard(data);
    setCopied(true);

    if (withToast) {
      toast.success("Copied to clipboard.");
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const Icon = copied ? Check : Copy;

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      aria-label="Copy code"
    >
      <Icon className="size-5" />
    </Button>
  );
};
