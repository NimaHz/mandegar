import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  durationSeconds?: number;
  label: string;
}

export function Marquee({ children, className, durationSeconds = 48, label }: MarqueeProps) {
  return (
    <div
      role="region"
      aria-label={label}
      className={cn("group relative overflow-hidden mask-x-from-85% mask-x-to-100%", className)}
      style={{ "--marquee-duration": `${durationSeconds}s` } as CSSProperties}
    >
      <div className="flex w-max animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center gap-12 ps-12">{children}</div>
        <div aria-hidden inert className="flex shrink-0 items-center gap-12 ps-12">
          {children}
        </div>
      </div>
    </div>
  );
}
