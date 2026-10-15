"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";

export function SmoothScroll() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return <ReactLenis root options={{ lerp: 0.12, anchors: true, wheelMultiplier: 0.9 }} />;
}
