import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import type { TicketStatus } from "@/types/support";

import { statusMeta, statusPath, statusStage, toneClasses } from "../../ticket-status";

interface StatusStepperProps {
  status: TicketStatus;
  label: string;
  copy: Record<TicketStatus, { label: string; description: string }>;
}

export function StatusStepper({ status, label, copy }: StatusStepperProps) {
  const stage = statusStage(status);
  const rejected = status === "rejected";

  return (
    <ol aria-label={label} className="flex flex-col">
      {statusPath.map((entry, position) => {
        const current = position === stage;
        const shown: TicketStatus = current ? status : entry;
        const meta = statusMeta[shown];
        const Icon = meta.icon;
        const done = position < stage;
        const tone = toneClasses[current ? meta.tone : "primary"];
        if (rejected && position === statusPath.length - 1 && !current) return null;
        return (
          <li
            key={entry}
            aria-current={current ? "step" : undefined}
            className="relative flex gap-3.5 pb-5 last:pb-0"
          >
            {position < statusPath.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute start-[0.9375rem] top-9 bottom-1 w-0.5 rounded-full",
                  done ? "bg-primary" : "bg-line",
                )}
              />
            )}
            <span
              className={cn(
                "relative grid size-8 shrink-0 place-items-center rounded-full",
                current && cn(tone.solid, "ring-4 ring-current/15"),
                done && "bg-primary-soft text-primary",
                !current && !done && "border border-line-strong bg-surface text-subtle",
              )}
            >
              {done ? (
                <Check className="size-4" strokeWidth={3} aria-hidden />
              ) : (
                <Icon className="size-4" aria-hidden />
              )}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pt-1">
              <span
                className={cn(
                  "text-sm",
                  current
                    ? cn("font-extrabold", tone.text)
                    : done
                      ? "font-bold text-ink"
                      : "font-semibold text-muted",
                )}
              >
                {copy[shown].label}
              </span>
              {current && (
                <span className="text-xs leading-6 text-body">{copy[shown].description}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
