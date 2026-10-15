import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export const LOGO_MARK_TILES = [
  {
    tone: "warm",
    d: "M6.2 4h3.6c7.51 0 13.6 6.09 13.6 13.6v4.7c0 0.61 -0.49 1.1 -1.1 1.1h-16.1c-1.22 0 -2.2 -0.98 -2.2 -2.2v-15c0 -1.22 0.98 -2.2 2.2 -2.2z",
  },
  {
    tone: "hot",
    d: "M44 6.2v3.6c0 7.51 -6.09 13.6 -13.6 13.6h-4.7c-0.61 0 -1.1 -0.49 -1.1 -1.1v-16.1c0 -1.22 0.98 -2.2 2.2 -2.2l15 0c1.22 0 2.2 0.98 2.2 2.2z",
  },
  {
    tone: "cold",
    d: "M41.8 44h-3.6c-7.51 0 -13.6 -6.09 -13.6 -13.6v-4.7c0 -0.61 0.49 -1.1 1.1 -1.1l16.1 0c1.22 0 2.2 0.98 2.2 2.2v15c0 1.22 -0.98 2.2 -2.2 2.2z",
  },
  {
    tone: "cool",
    d: "M4 41.8v-3.6c0 -7.51 6.09 -13.6 13.6 -13.6h4.7c0.61 0 1.1 0.49 1.1 1.1l0 16.1c0 1.22 -0.98 2.2 -2.2 2.2l-15 0c-1.22 0 -2.2 -0.98 -2.2 -2.2z",
  },
] as const;

export type LogoMarkTone = (typeof LOGO_MARK_TILES)[number]["tone"];

export const logoMarkFill: Record<LogoMarkTone, string> = {
  warm: "fill-mark-warm",
  hot: "fill-mark-hot",
  cold: "fill-mark-cold",
  cool: "fill-mark-cool",
};

interface LogoMarkProps extends ComponentProps<"svg"> {
  tone?: "color" | "mono";
  title?: string;
}

export function LogoMark({ tone = "color", title, className, ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
      {...props}
    >
      {title && <title>{title}</title>}
      {LOGO_MARK_TILES.map((tile) => (
        <path
          key={tile.tone}
          d={tile.d}
          className={tone === "color" ? logoMarkFill[tile.tone] : "fill-current"}
        />
      ))}
    </svg>
  );
}
