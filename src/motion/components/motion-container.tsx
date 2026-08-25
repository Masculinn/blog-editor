"use client";

import { motion, useInView } from "motion/react";
import React, { type FC, useMemo, useRef } from "react";
import { cn } from "../../lib/utils";
import animations from "../constants/animations";
import transitions from "../constants/transitions";
import { useAnimationMixer } from "../hooks";
import type {
  AnimationKeys,
  AnimationModule,
  MotionContainerProps,
  TransitionConfig,
} from "../types";

export const MotionContainer: FC<MotionContainerProps> = ({
  animation,
  controller = { isAnimationStopped: false, reverse: false },
  children,
  elementType = "div",
  className,
  ...props
}) => {
  const { mode, transition, delay, duration } = animation;

  const {
    configView = { amount: 0.5, once: true },
    isAnimationStopped,
    trigger,
    reverse,
  } = controller;

  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, configView);

  const mix = useMemo(() => getAnimationsToMix(mode), [mode]);
  const { initial, animate } = useAnimationMixer({
    animations: mix,
    reverse,
  });

  const transitionConfig: TransitionConfig = useMemo(() => {
    const selectedTransition = transitions[transition || "default"];

    if (isAnimationStopped) {
      return {
        ...selectedTransition,
        delay: 0,
        duration: duration || selectedTransition.duration,
      };
    }

    return {
      ...selectedTransition,
      delay: delay || 0,
      duration: duration || selectedTransition.duration,
    };
  }, [delay, duration, isAnimationStopped, transition]);

  const animationState = useMemo(() => {
    if (isAnimationStopped) return animate;

    if (typeof trigger !== "undefined") return trigger ? animate : initial;

    return isInView ? animate : initial;
  }, [isAnimationStopped, isInView, initial, animate, trigger]);

  const initialState = useMemo(() => {
    if (isAnimationStopped) return initial;

    return initial;
  }, [isAnimationStopped, initial]);

  if (!animation || typeof animation === "undefined") {
    throw new Error(
      "Oops, 'animation' prop cannot be undefined or null, check your motion providers.",
    );
  }

  const MotionElement = motion[
    elementType as keyof typeof motion
  ] as React.ElementType;

  if (!MotionElement)
    throw new Error(
      `Oops, '${elementType}' is not a valid motion element, check your motion providers.`,
    );

  return React.createElement(
    MotionElement,
    {
      animate: animationState,
      className: cn(className, "will-change-auto"),
      initial: initialState,
      ref,
      transition: transitionConfig,
      ...props,
    },
    children,
  );
};

function getAnimationsToMix(
  mode: AnimationKeys[] | AnimationKeys,
): AnimationModule[] | AnimationModule {
  if (!mode) {
    throw new Error(
      "'mode' prop cannot be undefined or null, fallback returning to 'default' animation.",
    );
  }

  if (Array.isArray(mode) && mode.length <= 0) {
    console.error(
      "Oops, 'mode' prop cannot be an empty array, fallback returning to 'default' animation.",
    );
    return animations.default;
  }

  const allModes = Object.keys(animations);

  if (Array.isArray(mode)) {
    const checkModeIsValid = mode.every((key) => allModes.includes(key));

    if (!checkModeIsValid) {
      console.error(
        "One or more of 'mode' member(s) are not matching with the pre-defined animation list. Check the type error, fallback returning to 'default' animation.",
      );
      return animations.default;
    }

    const extractedModes = mode.map((key) => animations[key]);
    return extractedModes;
  } else {
    if (typeof mode === "string") {
      const checkModeIsValid = allModes.includes(mode);
      if (!checkModeIsValid) {
        console.error(
          "The 'mode' you select is not matching with the pre-defined animation list. Check the type error, fallback returning to 'default' animation.",
        );
        return animations.default;
      }

      return animations[mode];
    }

    console.error(
      "Mode prop must be either 'AnimationKeys' or 'AnimationKeys[]'. Check the type error, fallback returning to 'default' animation.",
    );
    return animations.default;
  }
}
