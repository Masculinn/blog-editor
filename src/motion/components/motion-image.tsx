"use client";

import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { MotionImageProps } from "../types";
import { calculateDelay } from "../utils";
import { MotionContainer } from "./motion-container";

/**
 * @description
 * Renders an image as an N×N grid of independently-animated cells.
 * Each cell uses a CSS `background-image` slice so the image is never
 * duplicated in the DOM — only the positioning offset changes per cell.
 *
 * Image loading is handled by a detached `Image()` constructor so we can
 * react to the `load` event without mounting a real `<img>` element.
 * All standard `HTMLImageElement` attributes (`loading`, `decoding`,
 * `fetchPriority`, `crossOrigin`, …) are forwarded to that constructor
 * so the browser's resource-scheduling hints are honoured correctly.
 */
export const MotionImage: FC<MotionImageProps> = ({
  animation,
  config,
  controller,
  className,
  fallback,
  wrapperClassName,

  loading: _loading,
  decoding = "async",
  fetchPriority,
  crossOrigin,
  referrerPolicy,
  alt,
  onLoad,
  onError,

  ...wrapperProps
}) => {
  const {
    img: imageUrl,
    pieces,
    fn: motionFn,
    duration,
    customLogic,
    delayLogic = "sinusoidal",
  } = config;

  if (!imageUrl) {
    throw new Error(
      "MotionImage: 'config.img' is required. Provide a non-empty image URL.",
    );
  }
  if (pieces <= 0 || Math.sqrt(pieces) % 1 !== 0) {
    throw new Error(
      `MotionImage: 'config.pieces' must be a positive perfect square (4, 9, 16 … 144). Received: ${pieces}.`,
    );
  }

  const rafRef = useRef<number>(0);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [triggers, setTriggers] = useState<Record<number, boolean>>({});

  // biome-ignore lint/correctness/useExhaustiveDependencies: effect event inherits so its okay
  useEffect(() => {
    if (!imageUrl) return;

    setIsImageLoaded(false);

    const img = new Image();

    img.loading = "eager";

    img.decoding = decoding ?? "async";
    if (fetchPriority) img.fetchPriority = fetchPriority;
    if (crossOrigin) img.crossOrigin = crossOrigin;
    if (referrerPolicy) img.referrerPolicy = referrerPolicy;

    let cancelled = false;

    img.onload = (e) => {
      if (cancelled) return;
      setIsImageLoaded(true);
      onLoad?.(e as unknown as React.SyntheticEvent<HTMLImageElement>);
    };
    img.onerror = (e) => {
      if (cancelled) return;
      onError?.(e as unknown as React.SyntheticEvent<HTMLImageElement>);
    };

    img.src = imageUrl;

    if (img.complete && img.naturalWidth > 0) {
      setIsImageLoaded(true);
    }

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, decoding, fetchPriority, crossOrigin, referrerPolicy]);

  const columns = useMemo(() => Math.sqrt(pieces), [pieces]);
  const rows = useMemo(() => pieces / columns, [pieces, columns]);

  const handleGridInteraction = useCallback(
    (e: React.MouseEvent) => {
      if (!motionFn || !gridRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        if (!gridRef.current) return;

        const rect = gridRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor((x / rect.width) * columns);
        const row = Math.floor((y / rect.height) * rows);
        const index = row * columns + col;

        if (index >= 0 && index < pieces) {
          const affected: number[] = [];
          for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
              if (r >= 0 && r < rows && c >= 0 && c < columns) {
                affected.push(r * columns + c);
              }
            }
          }
          setTriggers((prev) => ({
            ...prev,
            ...Object.fromEntries(affected.map((idx) => [idx, true])),
          }));
        }
      });
    },
    [columns, rows, pieces, motionFn],
  );

  const gridCells = useMemo(() => {
    if (!isImageLoaded) return null;

    return Array.from({ length: pieces }).map((_, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const uniqueKey = `cell-${col}-${row}`;

      const pieceDelay = calculateDelay({
        delayLogic,
        index,
        baseDuration: duration,
        customLogic,
      });
      const delayTotal = (animation.delay ?? 0) + pieceDelay;

      const bgPosX =
        columns > 1 ? `calc(${col} * 100% / ${columns - 1})` : "0%";
      const bgPosY = rows > 1 ? `calc(${row} * 100% / ${rows - 1})` : "0%";

      return (
        <MotionContainer
          key={uniqueKey}
          animation={{ ...animation, delay: delayTotal, duration }}
          controller={{
            ...controller,
            trigger: motionFn ? !!triggers[index] : controller?.trigger,
          }}
          elementType="div"
          className={className}
        >
          <div
            aria-hidden
            style={{
              backgroundImage: `url('${imageUrl}')`,
              backgroundSize: `${columns * 100}% ${rows * 100}%`,
              backgroundPosition: `${bgPosX} ${bgPosY}`,
              backgroundRepeat: "no-repeat",
              height: "100%",
              width: "100%",
              borderStyle: "none",
            }}
          />
        </MotionContainer>
      );
    });
  }, [
    isImageLoaded,
    pieces,
    columns,
    rows,
    animation,
    controller,
    duration,
    motionFn,
    triggers,
    className,
    delayLogic,
    customLogic,
    imageUrl,
  ]);

  return (
    <div
      {...wrapperProps}
      className={wrapperClassName}
      style={{ position: "relative", ...wrapperProps.style }}
    >
      <div
        role="img"
        aria-label={alt}
        ref={gridRef}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          width: "100%",
          height: "100%",
          gap: "0px",
        }}
        onClick={motionFn === "click" ? handleGridInteraction : undefined}
        onMouseMove={motionFn === "hover" ? handleGridInteraction : undefined}
        onKeyUp={undefined}
      >
        {isImageLoaded ? gridCells : fallback}
      </div>
    </div>
  );
};
