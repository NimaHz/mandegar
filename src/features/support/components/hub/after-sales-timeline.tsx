import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { TicketStatus } from "@/types/support";

import type { SupportHubContent } from "../../content";
import { sideStatuses, statusMeta, statusPath, toneClasses } from "../../ticket-status";

interface AfterSalesTimelineProps {
  locale: Locale;
  content: SupportHubContent["timeline"];
  statuses: Record<TicketStatus, { label: string; description: string }>;
}

export function AfterSalesTimeline({ locale, content, statuses }: AfterSalesTimelineProps) {
  return (
    <section aria-labelledby="support-timeline-title" className="border-y border-line bg-surface">
      <div className="container-page flex flex-col gap-10 section-y">
        <SectionHeading
          id="support-timeline-title"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          {statusPath.map((status, index) => {
            const meta = statusMeta[status];
            const Icon = meta.icon;
            return (
              <li key={status} className="relative flex gap-4 lg:flex-col">
                {index < statusPath.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute start-6 top-14 bottom-[-1.5rem] w-0.5 bg-line sm:hidden lg:start-14 lg:end-[-1rem] lg:top-6 lg:bottom-auto lg:block lg:h-0.5 lg:w-auto"
                  />
                )}
                <span
                  className={cn(
                    "relative grid size-12 shrink-0 place-items-center rounded-full ring-8 ring-surface",
                    toneClasses[meta.tone].soft,
                  )}
                >
                  <Icon className="size-5.5" aria-hidden />
                  <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-inverse text-2xs font-black text-on-inverse">
                    {formatNumber(locale, index + 1)}
                  </span>
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-extrabold text-ink">{statuses[status].label}</h3>
                  <p className="text-sm leading-7 text-body">{statuses[status].description}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-col gap-4 rounded-card border border-dashed border-line-strong p-5 sm:p-6">
          <h3 className="text-sm font-extrabold text-ink">{content.sideTitle}</h3>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {sideStatuses.map((status) => {
              const meta = statusMeta[status];
              const Icon = meta.icon;
              return (
                <li key={status} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      toneClasses[meta.tone].soft,
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className={cn("text-sm font-extrabold", toneClasses[meta.tone].text)}>
                      {statuses[status].label}
                    </span>
                    <span className="text-xs leading-6 text-body">
                      {statuses[status].description}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
