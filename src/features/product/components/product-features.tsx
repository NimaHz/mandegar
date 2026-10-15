import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";
import type { ProductFeature } from "@/types/catalog";

import { FeatureIcon } from "./feature-icon";

interface ProductFeaturesProps {
  features: ProductFeature[];
  locale: Locale;
}

export function ProductFeatures({ features, locale }: ProductFeaturesProps) {
  return (
    <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => (
        <RevealItem key={feature.title}>
          <article className="group relative flex h-full flex-col gap-4 card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="icon-tile size-12 rounded-field transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
                <FeatureIcon name={feature.icon} className="size-5.5" strokeWidth={1.8} />
              </span>
              <span aria-hidden className="font-code text-sm font-bold text-subtle">
                {formatNumber(locale, index + 1, { minimumIntegerDigits: 2 })}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-ink">{feature.title}</h3>
            <p className="text-sm leading-7 text-body">{feature.body}</p>
          </article>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
