import { encode } from "uqr";

import { cn } from "@/lib/cn";

interface QrCodeProps {
  value: string;
  label: string;
  className?: string;
}

export function QrCode({ value, label, className }: QrCodeProps) {
  const { data, size } = encode(value, { border: 1 });
  const path = data
    .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : "")))
    .join("");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={cn("bg-white", className)}
    >
      <path d={path} className="fill-brand-deep" />
    </svg>
  );
}
