import { Check, X } from "lucide-react";

import { cn } from "@/lib/cn";

interface CoverageListProps {
  title: string;
  items: string[];
  variant: "covered" | "excluded";
  compact?: boolean;
}

export function CoverageList({ title, items, variant, compact = false }: CoverageListProps) {
  const covered = variant === "covered";
  const Icon = covered ? Check : X;

  return (
    <div className="flex flex-col gap-3">
      <h3 className={cn("font-bold text-ink", compact ? "text-sm" : "text-base")}>{title}</h3>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-7 text-body">
            <span
              className={cn(
                "mt-1 grid size-5 shrink-0 place-items-center rounded-full",
                covered ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
              )}
            >
              <Icon className="size-3" strokeWidth={3} aria-hidden />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
