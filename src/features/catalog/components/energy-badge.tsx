import { cn } from "@/lib/cn";
import type { EnergyClass } from "@/types/catalog";

const energyTones: Record<EnergyClass, string> = {
  "A+++": "bg-energy-a3 text-on-energy-a3",
  "A++": "bg-energy-a2 text-on-energy-a2",
  "A+": "bg-energy-a1 text-on-energy-a1",
  A: "bg-energy-a text-on-energy-a",
  B: "bg-energy-b text-on-energy-b",
  C: "bg-energy-c text-on-energy-c",
  D: "bg-energy-d text-on-energy-d",
};

interface EnergyBadgeProps {
  value: EnergyClass;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-5.5 ps-1.5 pe-3 text-caption",
  md: "h-6.5 ps-2 pe-3.5 text-xs",
  lg: "h-8 ps-2.5 pe-4.5 text-sm",
} as const;

export function EnergyBadge({ value, label, size = "md", className }: EnergyBadgeProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      title={label}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-s-[0.3125rem] font-code font-extrabold tracking-tight",
        "ltr:[clip-path:polygon(0_0,calc(100%-0.5rem)_0,100%_50%,calc(100%-0.5rem)_100%,0_100%)]",
        "rtl:[clip-path:polygon(0.5rem_0,100%_0,100%_100%,0.5rem_100%,0_50%)]",
        energyTones[value],
        sizes[size],
        className,
      )}
    >
      {label && <span className="sr-only">{label}</span>}
      <bdi aria-hidden dir="ltr">
        {value}
      </bdi>
    </span>
  );
}
