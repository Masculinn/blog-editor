"use client";

import { useEffect, useState } from "react";

type UseDebounce = <T>(value: T, delay: number) => T;

export const useDebounce: UseDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const debounce = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(debounce);
  }, [value, delay]);

  return debouncedValue;
};
