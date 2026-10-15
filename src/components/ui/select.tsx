import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";
import type { Option } from "@/types/common";

interface SelectProps extends ComponentProps<"select"> {
  options: readonly Option[];
  placeholder?: string;
  icon?: LucideIcon;
}

export function Select({ options, placeholder, icon: Icon, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted"
          aria-hidden
        />
      )}
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-control border border-line-strong bg-raised pe-9 text-sm font-semibold text-ellipsis text-ink transition-[border-color,box-shadow] duration-200 outline-none hover:border-ink/60 focus:border-primary focus:ring-3 focus:ring-primary/15",
          Icon ? "ps-10" : "ps-3.5",
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}
