import type { MotionPhase } from "./types";

export function createMotionConfig<T extends Record<string, MotionPhase>>(
  config: T,
) {
  return config;
}
