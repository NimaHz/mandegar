import { Plus } from "lucide-react";

import { Markdown } from "@/components/shared/markdown";
import { cn } from "@/lib/cn";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqListProps {
  items: FaqItem[];
  className?: string;
}

export function FaqList({ items, className }: FaqListProps) {
  return (
    <div className={cn("divide-y divide-line overflow-hidden card shadow-card", className)}>
      {items.map((item, index) => (
        <details key={item.question} open={index === 0} className="group/faq">
          <summary className="flex min-h-15 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start text-lead font-bold text-ink transition-colors outline-none select-none hover:bg-sunken/60 focus-visible:bg-sunken focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:px-6 [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-chip text-ink transition-[background-color,color,rotate] duration-300 group-open/faq:rotate-45 group-open/faq:bg-primary group-open/faq:text-on-primary"
            >
              <Plus className="size-4" strokeWidth={2.4} />
            </span>
          </summary>
          <Markdown
            source={item.answer}
            className="max-w-3xl px-5 pb-5 text-sm leading-8 text-pretty sm:px-6"
          />
        </details>
      ))}
    </div>
  );
}
