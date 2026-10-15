import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-shimmer rounded-control bg-[linear-gradient(90deg,var(--color-sunken)_0%,var(--color-surface)_50%,var(--color-sunken)_100%)] bg-size-[200%_100%]",
        className,
      )}
      {...props}
    />
  );
}
