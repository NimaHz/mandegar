"use client";

import { m, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

interface NumberTickerProps {
  value: number;
  from?: number;
  format?: (value: number) => string;
  className?: string;
}

export function NumberTicker({ value, from = value, format, className }: NumberTickerProps) {
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const display = format ?? ((current: number) => formatNumber(locale, current));
  const spring = useSpring(reduceMotion ? value : from, { stiffness: 140, damping: 24 });
  const text = useTransform(spring, (current) => display(Math.round(current)));

  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reduceMotion]);

  return (
    <span className={cn("inline-grid", className)}>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {display(value)}
      </span>
      <m.span aria-hidden className="col-start-1 row-start-1">
        {text}
      </m.span>
      <span className="sr-only">{display(value)}</span>
    </span>
  );
}
