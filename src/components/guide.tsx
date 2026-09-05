"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import slides from "../constants/guide.data";

const DEFAULT_SLIDE_DURATION_MS = 5200;

export function Guide() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const [autoplay] = useState(() =>
    Autoplay({
      playOnInit: true,
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

  useEffect(() => {
    if (!api) return;

    function syncSelectedSlide() {
      if (!api) return;

      setCurrent(api.selectedScrollSnap());
      setProgress(0);
    }

    syncSelectedSlide();

    api.on("select", syncSelectedSlide);
    api.on("reInit", syncSelectedSlide);

    return () => {
      api.off("select", syncSelectedSlide);
      api.off("reInit", syncSelectedSlide);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;

    function updateProgress() {
      if (!api) return;

      const index = api.selectedScrollSnap();
      const duration = slides[index]?.timeoutMs ?? DEFAULT_SLIDE_DURATION_MS;
      const timeUntilNext = autoplay.timeUntilNext();

      if (timeUntilNext === null) return;

      const nextProgress = Math.min(
        1,
        Math.max(0, 1 - timeUntilNext / duration),
      );

      setProgress(nextProgress);
    }

    updateProgress();

    const intervalId = window.setInterval(updateProgress, 50);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [api, autoplay]);

  return (
    <div className="relative w-full overflow-hidden rounded-t-2xl rounded-b-md border">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          watchDrag: false,
        }}
        plugins={[autoplay]}
        setApi={setApi}
        className="pointer-events-none w-full select-none"
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="basis-full pl-0">
              <article
                className="
                  relative
                  h-64
                  w-full
                  overflow-hidden

                  laptop:h-58
                  desktop:h-72
                "
              >
                <Image
                  unoptimized
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  draggable={false}
                  className="object-cover"
                  sizes="
                    (max-width: 1023px) 100vw,
                    (max-width: 1439px) 33vw,
                    33vw
                  "
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                />

                <div className="absolute inset-0 bg-linear-to-t from-black via-black/25 to-black/10" />
                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0
                    z-10
                    p-4

                    laptop:p-6
                  "
                >
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">
                    {slide.title}
                  </span>
                  <p
                    className="
                      mt-2
                      font-secondary
                      text-xs
                      leading-relaxed
                      tracking-tighter
                      text-foreground

                      laptop:text-sm
                    "
                  >
                    {slide.description}
                  </p>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-1">
        <div
          className="h-0.5 overflow-hidden rounded-full bg-white/25"
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
    </div>
  );
}
