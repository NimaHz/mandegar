"use client";

import { useEffect, useRef } from "react";

interface StepHeadingProps {
  title: string;
  description: string;
  focusOnMount: boolean;
}

export function StepHeading({ title, description, focusOnMount }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <div className="flex flex-col gap-1.5">
      <h2
        ref={ref}
        tabIndex={-1}
        className="font-display text-xl leading-snug font-black text-ink outline-none sm:text-2xl"
      >
        {title}
      </h2>
      <p className="text-sm leading-7 text-body">{description}</p>
    </div>
  );
}
