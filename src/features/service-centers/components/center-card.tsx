import { Clock, MapPin, Navigation, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { phoneHref } from "@/features/support/phone-href";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import type { ServiceCenter } from "@/types/content";

import type { ServiceCentersContent } from "../content";

interface CenterCardProps {
  locale: Locale;
  center: ServiceCenter;
  copy: ServiceCentersContent;
  headingLevel?: "h3" | "h4";
}

const kindTone = { dealer: "accent", service: "primary", both: "solid" } as const;

export function CenterCard({ locale, center, copy, headingLevel = "h3" }: CenterCardProps) {
  const Heading = headingLevel;
  const hasMap = center.lat !== null && center.lng !== null;
  const mapLinkClass =
    "inline-flex h-9 items-center gap-1.5 rounded-control border border-line-strong bg-surface px-3 text-xs font-bold text-ink transition-colors hover:border-primary hover:text-primary";

  return (
    <article className="flex h-full flex-col gap-4 card bg-raised p-5 shadow-card">
      <header className="flex flex-col gap-2">
        <Badge tone={kindTone[center.kind]} size="sm" className="self-start">
          {copy.kindBadge[center.kind]}
        </Badge>
        <Heading className="font-display text-lg leading-snug font-extrabold text-ink">
          {center.name}
        </Heading>
        <p className="inline-flex items-start gap-1.5 text-sm leading-7 text-body">
          <MapPin className="mt-1.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-semibold text-ink">
              {center.city}
              {locale === "fa" ? "، " : ", "}
              {center.provinceName}
            </span>
            <span className="block">{center.address}</span>
          </span>
        </p>
      </header>

      <dl className="flex flex-col gap-3 border-t border-line pt-4 text-sm">
        <div className="flex items-start gap-2">
          <dt className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-muted">
            <Clock className="size-4" aria-hidden />
            <span className="sr-only">{copy.card.hours}</span>
          </dt>
          <dd className="leading-6 text-ink-soft">{center.hours}</dd>
        </div>
        {center.phones.length > 0 && (
          <div className="flex items-start gap-2">
            <dt className="inline-flex shrink-0 items-center pt-1 text-muted">
              <Phone className="size-4" aria-hidden />
              <span className="sr-only">{copy.card.phones}</span>
            </dt>
            <dd className="flex flex-wrap gap-x-3 gap-y-1">
              {center.phones.map((phone) => (
                <a
                  key={phone}
                  href={phoneHref(phone)}
                  aria-label={`${fill(copy.card.call, { name: center.name })}: ${phone}`}
                  className="font-bold text-primary underline-offset-4 hover:underline"
                >
                  <bdi dir="ltr" className="font-code">
                    {phone}
                  </bdi>
                </a>
              ))}
            </dd>
          </div>
        )}
        {center.categories.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <dt className="text-caption font-semibold text-muted">{copy.card.categories}</dt>
            <dd className="flex flex-wrap gap-1.5">
              {center.categories.map((category) => (
                <span
                  key={category.slug}
                  className="rounded-full bg-chip px-2.5 py-0.5 text-caption font-semibold text-ink-soft"
                >
                  {category.name}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {hasMap && (
        <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
          <a
            href={`https://neshan.org/maps/@${center.lat},${center.lng},16z`}
            target="_blank"
            rel="noopener noreferrer"
            className={mapLinkClass}
          >
            <Navigation className="size-3.5" aria-hidden />
            {copy.card.neshan}
          </a>
          <a
            href={`https://balad.ir/location?latitude=${center.lat}&longitude=${center.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className={mapLinkClass}
          >
            <Navigation className="size-3.5" aria-hidden />
            {copy.card.balad}
          </a>
        </div>
      )}
    </article>
  );
}
