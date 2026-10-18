"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const STAGGER_MS = 50;

const revealSelf =
  "motion-safe:data-[reveal=pending]:translate-y-3.5 motion-safe:data-[reveal=pending]:opacity-0 data-[reveal=shown]:transition-[opacity,translate] data-[reveal=shown]:delay-(--reveal-delay) data-[reveal=shown]:duration-700 data-[reveal=shown]:ease-(--ease-out-expo)";

const revealItem =
  "motion-safe:group-data-[reveal=pending]/reveal:translate-y-3.5 motion-safe:group-data-[reveal=pending]/reveal:opacity-0 group-data-[reveal=shown]/reveal:transition-[opacity,translate] group-data-[reveal=shown]/reveal:delay-(--reveal-delay) group-data-[reveal=shown]/reveal:duration-600 group-data-[reveal=shown]/reveal:ease-(--ease-out-expo)";

let observer: IntersectionObserver | undefined;

const revealObserver = () => {
  observer ??= new IntersectionObserver(
    (entries, current) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        current.unobserve(entry.target);
        entry.target.setAttribute("data-reveal", "shown");
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  return observer;
};

const staggerItems = (group: HTMLElement) => {
  Array.from(group.children).forEach((child, index) => {
    if (child instanceof HTMLElement) {
      child.style.setProperty("--reveal-delay", `${index * STAGGER_MS}ms`);
    }
  });
};

type PendingHandler = (element: HTMLElement) => void;

const queued = new Map<HTMLElement, PendingHandler | undefined>();
let frame = 0;

const hideBelowFold = () => {
  frame = 0;
  const entries = [...queued];
  queued.clear();
  const below = entries.filter(
    ([element]) => element.getBoundingClientRect().top >= window.innerHeight,
  );
  for (const [element, onPending] of below) {
    element.dataset.reveal = "pending";
    onPending?.(element);
    revealObserver().observe(element);
  }
};

function useReveal(onPending?: PendingHandler) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    queued.set(element, onPending);
    frame ||= window.requestAnimationFrame(hideBelowFold);
    return () => {
      queued.delete(element);
      revealObserver().unobserve(element);
    };
  }, [onPending]);

  return ref;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className={cn(revealSelf, className)}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

export function RevealGroup({ children, className }: Omit<RevealProps, "delay">) {
  const ref = useReveal(staggerItems);

  return (
    <div ref={ref} className={cn("group/reveal", className)}>
      {children}
    </div>
  );
}

export function RevealItem({ children, className }: Omit<RevealProps, "delay">) {
  return <div className={cn(revealItem, className)}>{children}</div>;
}
