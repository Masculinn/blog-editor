"use client";

import { useEffect, useRef, useState } from "react";

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize((s) => {
        const w = Math.ceil(rect.width);
        const h = Math.ceil(rect.height);
        if (s.width === w && s.height === h) return s;
        return { width: w, height: h };
      });
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });

    ro.observe(el);

    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { ref, size };
}

export { useElementSize };
