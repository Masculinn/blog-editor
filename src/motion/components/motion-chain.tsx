"use client";

import { cn } from "@/lib/utils";
import type { FC } from "react";
import { Children, useMemo } from "react";
import type { MotionChainProps } from "../types";
import { calculateDelay } from "../utils";
import { MotionContainer } from "./motion-container";

export const MotionChain: FC<MotionChainProps> = ({
  animations,
  config = {
    delayLogic: "linear",
    duration: 1,
  },
  controller = { isAnimationStopped: false, reverse: false, trigger: true },
  children,
  elementType = "div",
  className,
  ...props
}) => {
  const { customLogic, delayLogic, duration } = config;

  const childItem = useMemo(() => Children.toArray(children), [children]);

  const compute = useMemo(() => {
    const checkRegisteredDelay = animations.some(
      (animation) =>
        typeof animation.delay === "undefined" ||
        !animation.delay ||
        typeof animation.delay !== "number",
    );

    if (typeof customLogic === "undefined") {
      return children.map((_, index) => {
        const calculatedDelay = calculateDelay({
          baseDuration: duration,
          delayLogic,
          index,
        });
        const delayTotal = !checkRegisteredDelay
          ? (animations[index].delay || 0) + calculatedDelay
          : calculatedDelay;

        return {
          ...animations[index],
          delay: delayTotal,
        };
      });
    }

    return animations.map((animation, idx) => {
      const calculatedDelay = calculateDelay({
        baseDuration: duration,
        customLogic,
        delayLogic: "custom",
        index: idx,
      });

      return {
        ...animation,
        delay: !checkRegisteredDelay
          ? calculatedDelay + (animation.delay || 0)
          : calculatedDelay,
      };
    });
  }, [animations, children, delayLogic, duration, customLogic]);

  if (animations.length !== children.length) {
    throw new Error(
      `Oops, the number of animations must match with the number of children inside 'MotionChain'. In your case animations.length: ${animations.length} !== children.length: ${children.length}`,
    );
  }

  return compute.map((animation, index) => (
    <MotionContainer
      animation={animation}
      className={cn(className)}
      controller={controller}
      elementType={elementType}
      // biome-ignore lint/suspicious/noArrayIndexKey: static index
      key={index}
      {...props}
    >
      {childItem[index]}
    </MotionContainer>
  ));
};
