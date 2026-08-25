"use client";

import { cn } from "@/lib/utils";
import type React from "react";
import { createElement, type FC, useMemo } from "react";
import type { MotionTextProps, SplittedTextModes } from "../types";
import { MotionChain } from "./motion-chain";

export const MotionText: FC<MotionTextProps> = ({
  animation,
  children,
  config = {
    delayLogic: "linear",
    duration: 0.5,
    mode: "chars",
    space: 0,
  },
  controller = {
    isAnimationStopped: false,
    reverse: false,
  },
  elementType,
  className,
  wrapperClassName,
  ...props
}) => {
  const { mode, space } = config;

  const tokens = useMemo(
    () =>
      getSplittedText({
        mode,
        text: children as string,
      }),
    [children, mode],
  );
  const unit = typeof space === "number" ? `${space}px` : space;
  const itemClassName = cn(className, "inline-block align-baseline");

  const itemStyle = {
    display: "inline-block",
    marginRight: unit ?? undefined,
    whiteSpace: "pre",
  } as React.CSSProperties;

  if (typeof children !== "string" || children.length === 0)
    throw new Error(
      "Oops, 'MotionText' component requires a 'children' prop and must be a non-empty 'string', check the type error.",
    );

  if (!elementType)
    throw new Error(
      "Oops, 'MotionText' component requires a valid 'elementType' prop, check the type error.",
    );

  return createElement(
    elementType as React.ElementType,
    {
      className: cn("flex flex-wrap", wrapperClassName),
    },
    <MotionChain
      animations={tokens.map(() => animation)}
      className={itemClassName}
      config={config}
      controller={controller}
      elementType="span"
      style={itemStyle}
      {...props}
    >
      {tokens.map((t) => (t === " " ? "\u00A0" : t))}
    </MotionChain>,
  );
};

type SplitTextProps = {
  text: string;
  mode?: SplittedTextModes;
};

function getSplittedText(props: SplitTextProps): string[] {
  const str: string[] = [];
  const { text, mode = "chars" } = props;

  if (!text || typeof text !== "string")
    throw new Error(
      "Oops, probably you forgot to pass a text child(e.g. '<MotionText>I am a text</MotionText>')?",
    );
  else if (mode === "words" && !text.includes(" "))
    throw new Error(
      "Oops, probably you assigned 'mode' prop as 'words' inside a 'MotionText' component but have you forgotten to add a space(e.g. '<MotionText>I am a text</MotionText>')?",
    );
  else {
    if (text.includes(" ")) {
      const words = text.split(/\s+/);

      words.forEach((w) => {
        str.push(w, " ");
      });

      return mode === "words" ? str.slice(0, -1) : str.join("").split("");
    } else {
      return text.split("");
    }
  }
}
