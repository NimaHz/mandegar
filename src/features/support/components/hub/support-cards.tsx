import {
  ArrowLeft,
  BookOpenText,
  Check,
  type LucideIcon,
  MapPin,
  MessagesSquare,
  SearchCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import type { SupportHubContent } from "../../content";

type CardKey = keyof SupportHubContent["cards"];

const cards: {
  key: Exclude<CardKey, "request">;
  href: string;
  icon: LucideIcon;
  className?: string;
}[] = [
  { key: "track", href: routes.track, icon: SearchCheck },
  { key: "warranty", href: routes.warranty, icon: ShieldCheck },
  { key: "guides", href: routes.guides, icon: BookOpenText },
  { key: "centers", href: routes.serviceCenters, icon: MapPin },
  { key: "faq", href: routes.faq, icon: MessagesSquare, className: "md:col-span-2 lg:col-span-2" },
];

const arrowClass =
  "size-4.5 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5";

interface SupportCardsProps {
  locale: Locale;
  content: SupportHubContent;
}

export function SupportCards({ locale, content }: SupportCardsProps) {
  const request = content.cards.request;

  return (
    <section aria-labelledby="support-cards-title" className="container-page pb-12 sm:pb-16">
      <h2 id="support-cards-title" className="sr-only">
        {content.cardsTitle}
      </h2>
      <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevealItem className="md:col-span-2 lg:col-span-1 lg:row-span-3">
          <Link
            href={localizePath(locale, routes.serviceRequest)}
            className="group relative isolate flex h-full flex-col gap-6 overflow-hidden rounded-panel bg-brand-deep p-6 text-white shadow-lift sm:p-8"
          >
            <span
              aria-hidden
              className="absolute -end-20 -top-20 -z-10 size-64 rounded-full bg-primary-glow/15 blur-2xl"
            />
            <span className="grid size-14 place-items-center rounded-field bg-accent text-on-accent">
              <Wrench className="size-7" aria-hidden />
            </span>
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-2xl leading-snug font-black sm:text-3xl">
                {request.label}
              </h3>
              <p className="text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
                {request.description}
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {content.requestPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2.5 text-sm font-semibold text-white/90"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/15">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <span className="mt-auto inline-flex h-12 items-center justify-center gap-2 self-start rounded-field bg-white px-5 text-sm font-extrabold text-brand-deep transition-colors group-hover:bg-canvas">
              {content.requestCta}
              <ArrowLeft className={arrowClass} aria-hidden />
            </span>
          </Link>
        </RevealItem>
        {cards.map((card) => {
          const Icon = card.icon;
          const copy = content.cards[card.key];
          return (
            <RevealItem key={card.key} className={cn("min-w-0", card.className)}>
              <Link
                href={localizePath(locale, card.href) as Route}
                className="group flex h-full card-interactive items-start gap-4 card bg-raised p-5 sm:p-6"
              >
                <span className="icon-tile size-12 rounded-field">
                  <Icon className="size-5.5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-base font-extrabold text-ink transition-colors group-hover:text-primary">
                    {copy.label}
                  </span>
                  <span className="text-sm leading-7 text-body">{copy.description}</span>
                </span>
                <ArrowLeft
                  className={cn(arrowClass, "mt-1 text-muted group-hover:text-primary")}
                  aria-hidden
                />
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
