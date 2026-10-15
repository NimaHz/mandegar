"use client";

import { useInView } from "motion/react";
import { useRef } from "react";

import { NumberTicker } from "@/components/motion/number-ticker";

interface StatTickerProps {
  value: number;
  className?: string;
}

export function StatTicker({ value, className }: StatTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  return (
    <span ref={ref} className={className}>
      <NumberTicker key={inView ? "live" : "rest"} value={value} from={inView ? 0 : value} />
    </span>
  );
}
