"use client";

import { m, type Variants } from "motion/react";
import { type ComponentProps, useState } from "react";

import { FEEDBACK } from "./easing";

export type PulseEffect = "pop" | "soft" | "wiggle";

const keyframes: Record<PulseEffect, Variants[string]> = {
  pop: {
    scale: [1, 1.28, 0.94, 1],
    transition: { duration: FEEDBACK.pop, ease: "easeOut", times: [0, 0.35, 0.7, 1] },
  },
  soft: {
    scale: [1, 1.035, 0.995, 1],
    transition: { duration: FEEDBACK.pop, ease: "easeOut", times: [0, 0.4, 0.75, 1] },
  },
  wiggle: {
    rotate: [0, -14, 10, -5, 0],
    transition: { duration: FEEDBACK.pop + 0.18, ease: "easeOut" },
  },
};

const variantsFor = (effect: PulseEffect): Variants => ({
  rest: { scale: 1, rotate: 0 },
  odd: keyframes[effect],
  even: keyframes[effect],
});

const variantsByEffect = {
  pop: variantsFor("pop"),
  soft: variantsFor("soft"),
  wiggle: variantsFor("wiggle"),
};

export const pulseMotion = (pulse: number, effect: PulseEffect = "pop") => ({
  variants: variantsByEffect[effect],
  initial: "rest",
  animate: pulse === 0 ? "rest" : pulse % 2 ? "odd" : "even",
});

export function usePulse() {
  const [pulse, setPulse] = useState(0);
  return [pulse, () => setPulse((count) => count + 1)] as const;
}

interface PulseProps extends Omit<
  ComponentProps<typeof m.span>,
  "animate" | "initial" | "variants"
> {
  pulse: number;
  effect?: PulseEffect;
}

export function Pulse({ pulse, effect = "pop", ...props }: PulseProps) {
  return <m.span {...props} {...pulseMotion(pulse, effect)} />;
}
