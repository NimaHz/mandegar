"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

interface FocusHeadingProps {
  id: string;
  dir?: "auto";
  children: ReactNode;
  className?: string;
}

export function FocusHeading({ id, dir, children, className }: FocusHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <h2
      ref={ref}
      id={id}
      dir={dir}
      tabIndex={-1}
      className={cn("scroll-mt-32 outline-none", className)}
    >
      {children}
    </h2>
  );
}
