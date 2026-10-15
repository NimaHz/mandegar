import { cn } from "@/lib/cn";

export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 56"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("block h-10 w-full sm:h-14", className)}
    >
      <path
        d="M0 30C180 12 360 6 540 14S900 46 1080 44 1350 26 1440 18"
        fill="none"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className="stroke-accent"
      />
      <path
        d="M0 40C180 22 360 16 540 24S900 56 1080 54 1350 36 1440 28"
        fill="none"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        className="stroke-primary"
      />
    </svg>
  );
}
