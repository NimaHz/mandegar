"use client";

import { m, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { EASE_OUT_EXPO } from "./easing";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </m.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

export function RevealGroup({ children, className }: Omit<RevealProps, "delay">) {
  return (
    <m.div
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: Omit<RevealProps, "delay">) {
  return (
    <m.div className={className} variants={itemVariants}>
      {children}
    </m.div>
  );
}
