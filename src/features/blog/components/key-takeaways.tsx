import { ListChecks } from "lucide-react";

import { Markdown } from "@/components/shared/markdown";

import type { Takeaways } from "../article";

export function KeyTakeaways({ takeaways }: { takeaways: Takeaways }) {
  return (
    <aside
      aria-labelledby="post-takeaways"
      className="relative isolate overflow-hidden rounded-card border border-primary/20 bg-primary-soft/45 p-5 sm:p-7"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 w-1 bg-linear-to-b from-accent to-primary"
      />
      <h2
        id="post-takeaways"
        className="flex items-center gap-2.5 font-display text-lg font-black text-ink"
      >
        <span className="icon-tile size-9 bg-raised">
          <ListChecks className="size-4.5" aria-hidden />
        </span>
        {takeaways.title}
      </h2>
      <Markdown source={takeaways.source} className="mt-4 text-sm leading-7 sm:text-lead" />
    </aside>
  );
}
