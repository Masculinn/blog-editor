"use client";

import { type FC, useEffect, useMemo, useRef, useState } from "react";
import type { AnimationKeys, MotionMovieProps } from "../types";
import { MotionImage } from "./motion-image";

/**
 * @description
 * A wrapper for `MotionImage` that cycles through a sequence of images,
 * creating an auto-slider with enter/exit animations per slide.
 *
 * ### Lifecycle per slide
 * 1. Preloads (and optionally prefetches) `config.images` on mount.
 * 2. Cycles frames on an interval derived from `animationDuration`.
 * 3. Fires `enter` animations at the start of each frame.
 * 4. Fires `exit` animations at mid-cycle via a scoped timeout.
 * 5. Exposes the active index to the parent via `onIndexChange`.
 *
 * @example
 * const [slide, setSlide] = useState(0);
 * const images = ["PATH_TO_IMAGE_1", "PATH_TO_IMAGE_2"];
 *
 * <MotionMovie
 *   animations={{
 *     enter: ["filterBlurIn", "fadeIn"],
 *     exit:  ["fadeOut"],
 *     transition: "smooth",
 *     duration: 1,
 *   }}
 *   config={{
 *     pieces: 64,
 *     images,
 *     animationDuration: 5,
 *     delayLogic: "sinusoidal",
 *   }}
 *   onIndexChange={setSlide}
 *   loading="lazy"
 *   prefetch
 *   wrapperClassName="size-[500px] rounded-lg overflow-hidden"
 *   className="size-full"
 *   fallback={<div className="size-full animate-pulse bg-stone-800 rounded-lg" />}
 * />
 */
export const MotionMovie: FC<MotionMovieProps> = ({
  animations,
  config,
  controller,
  fallback,
  wrapperClassName,
  className,
  onIndexChange,

  loading,
  decoding,
  fetchPriority,
  crossOrigin,
  referrerPolicy,
  sizes,
  srcSet,
  alt,
  draggable,
  onLoad,
  onError,

  prefetch = false,
  ...divProps
}) => {
  const { enter, exit, transition, duration = 0.5 } = animations;
  const { animationDuration, images } = config;

  if (!Array.isArray(images) || images.length === 0) {
    throw new Error(
      "MotionMovie: 'config.images' must be a non-empty array of strings.",
    );
  }
  if (!Array.isArray(enter) || enter.length === 0) {
    throw new Error(
      "MotionMovie: 'animations.enter' must be a non-empty array of AnimationKeys.",
    );
  }
  if (!Array.isArray(exit) || exit.length === 0) {
    throw new Error(
      "MotionMovie: 'animations.exit' must be a non-empty array of AnimationKeys.",
    );
  }
  if (animationDuration <= duration) {
    throw new Error(
      "MotionMovie: 'config.animationDuration' must be strictly greater than 'animations.duration'.",
    );
  }

  const [currImgIdx, setCurrImgIdx] = useState<number>(0);
  const [animation, setAnimation] = useState<AnimationKeys[] | AnimationKeys>(
    enter,
  );

  const tickRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    onIndexChange?.(currImgIdx);
  }, [currImgIdx, onIndexChange]);

  useEffect(() => {
    images.forEach((src) => {
      if (prefetch) {
        const id = `mp-prefetch-${encodeURIComponent(src)}`;
        if (!document.getElementById(id)) {
          const link = document.createElement("link");
          link.id = id;
          link.rel = "prefetch";
          link.href = src;
          link.as = "image";
          document.head.appendChild(link);
        }
      } else {
        const img = new Image();
        img.src = src;

        if (loading) img.loading = loading;
        if (decoding) img.decoding = decoding;
        if (fetchPriority) img.fetchPriority = fetchPriority;
        if (crossOrigin) img.crossOrigin = crossOrigin;
      }
    });
  }, [images, prefetch, loading, decoding, fetchPriority, crossOrigin]);

  useEffect(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
    intervalRef.current = null;
    exitTimeoutRef.current = null;

    tickRef.current = 0;
    setAnimation(enter);

    const cycle = Math.max(1, Math.round(animationDuration * 2));
    const halfDuration = Math.round(animationDuration);
    const halfDelayMs = Math.round((animationDuration / 2) * 1000);

    intervalRef.current = window.setInterval(() => {
      tickRef.current += 1;
      const trigger = tickRef.current % cycle;

      if (trigger === 0) {
        setCurrImgIdx((prev) => (prev + 1) % images.length);
        setAnimation(enter);
      }

      if (trigger === halfDuration) {
        if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = window.setTimeout(() => {
          setAnimation(exit);
        }, halfDelayMs);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (exitTimeoutRef.current) window.clearTimeout(exitTimeoutRef.current);
    };
  }, [images.length, animationDuration, enter, exit]);

  const motionImageAnimation = useMemo(
    () => ({ transition, duration, mode: animation }),
    [transition, duration, animation],
  );

  const motionImageConfig = useMemo(
    () => ({ ...config, img: images[currImgIdx], duration }),
    [config, images, currImgIdx, duration],
  );

  const imageHtmlProps = useMemo(
    () => ({
      loading,
      decoding,
      fetchPriority,
      crossOrigin,
      referrerPolicy,
      sizes,
      srcSet,
      alt,
      draggable,
      onLoad,
      onError,
    }),
    [
      loading,
      decoding,
      fetchPriority,
      crossOrigin,
      referrerPolicy,
      sizes,
      srcSet,
      alt,
      draggable,
      onLoad,
      onError,
    ],
  );

  return (
    <div
      {...divProps}
      className={wrapperClassName}
      style={{ overflow: "hidden", ...divProps.style }}
    >
      <MotionImage
        animation={motionImageAnimation}
        config={motionImageConfig}
        className={className}
        wrapperClassName="size-full"
        controller={controller}
        fallback={fallback}
        {...imageHtmlProps}
      />
    </div>
  );
};
