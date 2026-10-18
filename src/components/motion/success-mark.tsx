"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "@/lib/cn";

import { EASE_OUT_EXPO, springSnappy } from "./easing";

interface SuccessMarkProps {
  className?: string;
  delay?: number;
}

export function SuccessMark({ className, delay = 0 }: SuccessMarkProps) {
  const reduceMotion = useReducedMotion();
  const draw = (start: number) =>
    reduceMotion
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 0.5, ease: EASE_OUT_EXPO, delay: delay + start },
        };

  return (
    <m.svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className={cn("size-12 text-success", className)}
      initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...springSnappy, delay }}
    >
      <circle cx="24" cy="24" r="22" className="fill-current opacity-15" />
      <m.circle
        cx="24"
        cy="24"
        r="20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        {...draw(0)}
      />
      <m.path
        d="M15.5 24.5l6 6 11-12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.28)}
      />
    </m.svg>
  );
}
