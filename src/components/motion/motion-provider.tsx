"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const importFeatures = () => import("./features").then((module) => module.motionFeatures);

let features: ReturnType<typeof importFeatures> | undefined;

const loadFeatures = () => (features ??= importFeatures());

if (typeof window !== "undefined") void loadFeatures();

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
