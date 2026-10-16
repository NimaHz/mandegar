import { Gauge, MapPinned, ShieldCheck, Wrench } from "lucide-react";
import Image from "next/image";

import { LogoMark } from "@/components/brand/logo-mark";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";
import { blurProps } from "@/lib/image";
import type { ImageAsset } from "@/types/common";

import { homeContent } from "../content";

interface WhyMandegarProps {
  image: ImageAsset | null;
  warrantyMonths: number;
  locale: Locale;
}

const values = [
  { key: "durability", icon: Wrench },
  { key: "efficiency", icon: Gauge },
  { key: "network", icon: MapPinned },
  { key: "parts", icon: ShieldCheck },
] as const;

export function WhyMandegar({ image, warrantyMonths, locale }: WhyMandegarProps) {
  const content = homeContent[locale].why;

  return (
    <section aria-labelledby="home-why" className="container-page section-y">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="relative">
          <div className="relative aspect-4/5 overflow-hidden rounded-panel bg-sunken shadow-lift sm:aspect-5/4 lg:aspect-4/5">
            {image ? (
              <>
                <Image
                  src={image.src}
                  {...blurProps(image)}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-night/55 via-transparent to-transparent"
                />
              </>
            ) : (
              <LogoMark className="absolute inset-0 m-auto size-2/5" />
            )}
          </div>
          {warrantyMonths > 0 && (
            <div className="absolute start-5 -bottom-6 flex items-center gap-3.5 panel bg-raised p-4 pe-6 shadow-lift sm:start-8 lg:start-auto lg:-end-8">
              <span className="grid size-12 place-items-center rounded-full bg-accent text-on-accent">
                <ShieldCheck className="size-6" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="font-display text-xl font-black text-ink">
                  {fill(content.badge, { count: formatNumber(locale, warrantyMonths) })}
                </span>
                <span className="text-xs font-semibold text-muted">{content.badgeCaption}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 max-lg:pt-4">
          <SectionHeading
            id="home-why"
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <RevealGroup className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {values.map(({ key, icon: Icon }, index) => (
              <RevealItem key={key} className="flex flex-col gap-3 border-t border-line pt-5">
                <span className="flex items-center gap-3">
                  <span className="icon-tile size-11 rounded-field">
                    <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span aria-hidden className="font-code text-xs font-bold text-subtle">
                    {formatNumber(locale, index + 1, { minimumIntegerDigits: 2 })}
                  </span>
                </span>
                <h3 className="text-lg font-extrabold text-ink">{content.items[key].title}</h3>
                <p className="text-sm leading-7 text-body">{content.items[key].body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
