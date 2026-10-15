import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface StatusScreenProps {
  visual: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function StatusScreen({
  visual,
  title,
  description,
  actions,
  children,
  className,
}: StatusScreenProps) {
  return (
    <section
      aria-labelledby="status-title"
      className={cn("bg-glow bg-dots overflow-hidden", className)}
    >
      <div className="container-page flex flex-col items-center gap-6 py-14 text-center sm:py-20">
        <div className="animate-rise">{visual}</div>
        <div className="flex max-w-xl animate-rise flex-col items-center gap-3">
          <h1
            id="status-title"
            className="font-display text-[1.75rem] leading-snug font-black text-balance text-ink sm:text-[2.25rem]"
          >
            {title}
          </h1>
          <p className="text-lead leading-8 text-pretty text-body sm:text-base">{description}</p>
        </div>
        {actions && (
          <div className="flex animate-rise flex-wrap justify-center gap-3">{actions}</div>
        )}
        {children && <div className="mt-4 w-full max-w-3xl">{children}</div>}
      </div>
    </section>
  );
}
