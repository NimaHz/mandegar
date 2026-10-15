import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  title: ReactNode;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
  id?: string;
  className?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  align = "start",
  id,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-6 gap-y-3",
        centered ? "flex-col items-center text-center" : "items-end justify-between",
        className,
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-2", centered && "items-center")}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2
          id={id}
          className="font-display text-[1.625rem] leading-snug font-black text-ink sm:text-[2rem]"
        >
          {title}
        </h2>
        {description && <p className="text-lead leading-8 text-body sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
