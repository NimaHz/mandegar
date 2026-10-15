import { cn } from "@/lib/cn";

import type { GlossaryLetter } from "../terms";

interface GlossaryJumpNavProps {
  letters: GlossaryLetter[];
  label: string;
}

export function GlossaryJumpNav({ letters, label }: GlossaryJumpNavProps) {
  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-30 border-y border-line bg-canvas/90 backdrop-blur-xl lg:top-18"
    >
      <ol className="container-page scrollbar-none flex gap-0.5 overflow-x-auto py-2.5 lg:flex-wrap lg:justify-center">
        {letters.map(({ label: letter, anchor, terms }) => {
          const empty = terms.length === 0;
          return (
            <li key={anchor} className="shrink-0">
              {empty ? (
                <span
                  aria-hidden
                  className="grid size-8 place-items-center rounded-control font-display text-sm font-bold text-subtle/60"
                >
                  {letter}
                </span>
              ) : (
                <a
                  href={`#${anchor}`}
                  className={cn(
                    "grid size-8 place-items-center rounded-control font-display text-sm font-black text-ink transition-colors",
                    "hover:bg-primary hover:text-on-primary",
                  )}
                >
                  {letter}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
