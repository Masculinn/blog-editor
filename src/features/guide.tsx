"use client";

import Autoplay from "embla-carousel-autoplay";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

const slides = [
  {
    id: "alpine-lake",
    eyebrow: "Explore",
    title: "Quiet alpine mornings",
    description:
      "A compact hero carousel with per-slide timing and interaction-aware autoplay.",
    image: "/assets/guide/annie-spratt-vhy5VkrUjME-unsplash.jpg",
    alt: "Mountain lake surrounded by alpine peaks",
    timeoutMs: 5200,
  },
  {
    id: "forest-road",
    eyebrow: "Discover",
    title: "Routes worth taking slowly",
    description:
      "Press, touch and hold, or use the pause control to stop the current slide.",
    image: "/assets/guide/martin-adams-LuH6F1tgdB8-unsplash.jpg",
    alt: "Sunlight passing through a green forest",
    timeoutMs: 6800,
  },
  {
    id: "coast",
    eyebrow: "Breathe",
    title: "Make room for the horizon",
    description:
      "Embla loop mode keeps the sequence cycling indefinitely without a hard end.",
    image: "/assets/guide/nasa-hubble-space-telescope-SkInLcVMCUI-unsplash.jpg",
    alt: "Open landscape beneath a warm sky",
    timeoutMs: 4600,
  },
  {
    id: "mountain-view",
    eyebrow: "Repeat",
    title: "One more view, then another",
    description:
      "The countdown reflects the active slide's own timeout before autoplay advances.",
    image: "/assets/guide/ricardo-gomez-angel-RjBXz3rtdLw-unsplash.jpg",
    alt: "Mountain landscape reflected in blue water",
    timeoutMs: 6000,
  },
] as const;

const DEFAULT_SLIDE_DURATION_MS = 5200;

type HoldReason = "pointer" | "keyboard" | "visibility" | "manual";

const HOLD_POINTER: HoldReason = "pointer";
const HOLD_KEYBOARD: HoldReason = "keyboard";
const HOLD_VISIBILITY: HoldReason = "visibility";

type AutoplayWithPause = ReturnType<typeof Autoplay> & {
  pause?: () => void;
};

export function Guide() {
  const [api, setApi] = useState<CarouselApi>();

  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const holdReasonsRef = useRef<Set<HoldReason>>(new Set());
  const progressRef = useRef(0);
  const remainingMsRef = useRef<number>(DEFAULT_SLIDE_DURATION_MS);
  const pausedProgressRef = useRef(0);
  const pausedRemainingRef = useRef<number>(DEFAULT_SLIDE_DURATION_MS);

  const [autoplay] = useState(() =>
    Autoplay({
      playOnInit: false,
      stopOnLastSnap: false,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,

      delay: (scrollSnapList) =>
        scrollSnapList.map(
          (_, index) => slides[index]?.timeoutMs ?? DEFAULT_SLIDE_DURATION_MS,
        ),
    }),
  );

  function pauseAutoplay(reason: HoldReason) {
    const wasAlreadyPaused = holdReasonsRef.current.size > 0;

    holdReasonsRef.current.add(reason);

    if (wasAlreadyPaused) {
      return;
    }

    pausedProgressRef.current = progressRef.current;
    pausedRemainingRef.current = remainingMsRef.current;

    const controller = autoplay as AutoplayWithPause;

    if (typeof controller.pause === "function") {
      controller.pause();
    } else {
      controller.stop();
    }

    setIsPaused(true);
  }

  function resumeAutoplay(reason: HoldReason) {
    holdReasonsRef.current.delete(reason);

    if (holdReasonsRef.current.size > 0) return;

    autoplay.play();

    setIsPaused(false);
  }

  function toggleAutoplay() {
    if (holdReasonsRef.current.has("manual")) {
      resumeAutoplay("manual");
      return;
    }

    pauseAutoplay("manual");
  }

  useEffect(() => {
    if (!api) return;

    const carouselApi = api;

    function syncSelectedSlide() {
      const index = carouselApi.selectedScrollSnap();

      const duration = slides[index]?.timeoutMs ?? DEFAULT_SLIDE_DURATION_MS;

      setCurrent(index);

      if (holdReasonsRef.current.size === 0 && autoplay.isPlaying()) {
        autoplay.reset();
      }

      progressRef.current = 0;
      remainingMsRef.current = duration;

      pausedProgressRef.current = 0;
      pausedRemainingRef.current = duration;

      setProgress(0);
    }

    void syncSelectedSlide();

    autoplay.play();

    carouselApi.on("select", syncSelectedSlide);
    carouselApi.on("reInit", syncSelectedSlide);

    return () => {
      autoplay.stop();

      carouselApi.off("select", syncSelectedSlide);
      carouselApi.off("reInit", syncSelectedSlide);
    };
  }, [api, autoplay]);

  useEffect(() => {
    if (!api) return;

    const carouselApi = api;

    function updateProgress() {
      const index = carouselApi.selectedScrollSnap();
      const duration = slides[index]?.timeoutMs ?? DEFAULT_SLIDE_DURATION_MS;

      const timeUntilNext = autoplay.timeUntilNext();

      if (timeUntilNext !== null) {
        const nextProgress = Math.min(
          1,
          Math.max(0, 1 - timeUntilNext / duration),
        );

        progressRef.current = nextProgress;
        remainingMsRef.current = timeUntilNext;

        pausedProgressRef.current = nextProgress;
        pausedRemainingRef.current = timeUntilNext;

        setProgress(nextProgress);

        return;
      }

      if (holdReasonsRef.current.size > 0)
        setProgress(pausedProgressRef.current);
    }

    updateProgress();

    const intervalId = window.setInterval(updateProgress, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [api, autoplay]);

  useEffect(() => {
    const controller = autoplay as AutoplayWithPause;

    function onVisibilityChange() {
      if (document.hidden) {
        const wasAlreadyPaused = holdReasonsRef.current.size > 0;

        holdReasonsRef.current.add(HOLD_VISIBILITY);

        if (!wasAlreadyPaused) {
          pausedProgressRef.current = progressRef.current;
          pausedRemainingRef.current = remainingMsRef.current;

          if (typeof controller.pause === "function") controller.pause();
          else controller.stop();

          setIsPaused(true);
        }

        return;
      }

      holdReasonsRef.current.delete(HOLD_VISIBILITY);

      if (holdReasonsRef.current.size === 0) {
        autoplay.play();
        setIsPaused(false);
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [autoplay]);

  return (
    <div className="size-full">
      <Card
        size="sm"
        ref={rootRef}
        className="relative overflow-hidden border-border/60 bg-card p-0 shadow-sm  border-none size-full"
        onPointerDown={() => {
          pauseAutoplay(HOLD_POINTER);
        }}
        onPointerUp={() => {
          resumeAutoplay(HOLD_POINTER);
        }}
        onPointerCancel={() => {
          resumeAutoplay(HOLD_POINTER);
        }}
        onKeyDown={() => {
          pauseAutoplay(HOLD_KEYBOARD);
        }}
        onKeyUp={() => {
          resumeAutoplay(HOLD_KEYBOARD);
        }}
      >
        <CardContent className="p-0 size-full">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
            }}
            plugins={[autoplay]}
            setApi={setApi}
            className="size-full"
          >
            <CarouselContent className="ml-0 size-full z-50">
              {slides.map((slide, index) => (
                <CarouselItem key={slide.id} className="pl-0 size-full">
                  <article className="relative laptop:h-58 desktop:h-76 overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      className="absolute inset-0 size-full select-none object-cover"
                      draggable={false}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/25 to-black/10" />
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white sm:p-6">
                      <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 sm:text-xs">
                        {slide.eyebrow}
                      </span>
                      <p className="mt-2 max-w-2xs text-xs leading-relaxed text-white/80 sm:text-sm tracking-tight">
                        {slide.description}
                      </p>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </CardContent>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-1">
          <div
            className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25"
            role="progressbar"
            aria-label={`Time remaining for slide ${current + 1}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div
              className="h-full origin-left rounded-full bg-white transition-[width] duration-75 ease-linear"
              style={{
                width: `${progress * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="absolute top-3 right-3 z-30 sm:bottom-4 sm:right-4">
          <Button
            type="button"
            size="icon-sm"
            variant="primary"
            className="rounded-full shadow-sm backdrop-blur-md z-50"
            aria-label={
              isPaused ? "Resume carousel autoplay" : "Pause carousel autoplay"
            }
            aria-pressed={isPaused}
            onClick={toggleAutoplay}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
