import type { Transition } from "motion/react";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const springSnappy: Transition = { type: "spring", stiffness: 420, damping: 36 };

export const springSwap: Transition = { type: "spring", stiffness: 520, damping: 28 };
