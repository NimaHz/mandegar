import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        chip: "bg-chip text-ink",
        solid: "bg-inverse text-on-inverse",
        outline: "border border-line-strong text-ink-soft",
        primary: "bg-primary-soft text-primary",
        accent: "bg-accent text-on-accent",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        glass: "bg-white/10 text-white ring-1 ring-white/15",
      },
      size: {
        sm: "h-6 px-2.5 text-caption",
        md: "h-7 px-3 text-xs",
        lg: "h-8 px-3.5 text-label",
      },
    },
    defaultVariants: {
      tone: "chip",
      size: "md",
    },
  },
);

export function Badge({
  className,
  tone,
  size,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
