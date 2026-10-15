import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-bold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,scale] duration-200 ease-out select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-strong hover:shadow-primary",
        accent: "bg-accent text-on-accent hover:bg-accent/90",
        dark: "bg-inverse text-on-inverse hover:bg-inverse/90",
        outline: "border border-ink bg-transparent text-ink hover:bg-inverse hover:text-on-inverse",
        soft: "bg-chip text-ink hover:bg-line",
        ghost: "text-primary hover:bg-primary-soft",
        line: "border border-line-strong bg-surface text-ink hover:border-ink",
        inverse: "bg-white text-brand-deep hover:bg-canvas dark:hover:bg-ink",
        danger: "text-danger hover:bg-danger-soft",
      },
      size: {
        sm: "h-9 rounded-lg px-3.5 text-label",
        md: "h-11 rounded-control px-5 text-sm",
        lg: "h-13 rounded-field px-6 text-lead",
        icon: "size-10 rounded-control",
        "icon-lg": "size-12 rounded-field",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonStyles> & { className?: string };

export const buttonVariants = ({ className, ...props }: ButtonStyleProps = {}) =>
  cn(buttonStyles(props), className);

export function Button({
  className,
  variant,
  size,
  block,
  type = "button",
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonStyles>) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, block, className })}
      {...props}
    />
  );
}
