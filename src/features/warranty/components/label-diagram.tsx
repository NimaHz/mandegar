import { LogoMark } from "@/components/brand/logo-mark";
import { QrCode } from "@/components/ui/qr-code";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo/metadata";
import { formatWarrantyCode } from "@/lib/warranty-code";

import type { WarrantyContent } from "../content";

const SAMPLE_CODE = "W5K3M9XTS";

interface LabelDiagramProps {
  locale: Locale;
  content: WarrantyContent["label"];
}

function Pin({ locale, value }: { locale: Locale; value: number }) {
  return (
    <span
      aria-hidden
      className="absolute -end-3 -top-3 grid size-7 place-items-center rounded-full bg-accent text-xs font-black text-on-accent shadow-card ring-4 ring-white"
    >
      {formatNumber(locale, value)}
    </span>
  );
}

export function LabelDiagram({ locale, content }: LabelDiagramProps) {
  const { diagram } = content;

  return (
    <figure
      role="img"
      aria-label={content.diagramLabel}
      className="bg-dots relative isolate overflow-hidden rounded-panel border border-line bg-sunken px-5 py-10 sm:px-10 sm:py-14"
    >
      {["top-4 start-4", "top-4 end-4", "bottom-4 start-4", "bottom-4 end-4"].map((position) => (
        <span
          key={position}
          aria-hidden
          className={`absolute ${position} size-3 rounded-full bg-line-strong/70 ring-2 ring-surface`}
        />
      ))}
      <div
        aria-hidden
        className="absolute inset-y-10 end-6 flex flex-col justify-center gap-2 max-sm:hidden"
      >
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="h-1.5 w-14 rounded-full bg-line" />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-[22rem] -rotate-[1.5deg] overflow-hidden rounded-card bg-white text-night shadow-lift ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 bg-brand-deep px-4 py-2.5 text-white">
          <span className="inline-flex items-center gap-2">
            <LogoMark className="size-6" />
            <span dir="ltr" className="font-display text-xs font-black tracking-[0.3em]">
              MANDEGAR
            </span>
          </span>
          <span className="text-caption font-bold text-white/80">{diagram.heading}</span>
        </div>
        <div className="flex flex-col gap-3 px-4 pt-3.5 pb-4">
          <bdi dir="ltr" className="font-code text-lg font-bold">
            {diagram.model}
          </bdi>
          <dl className="flex flex-col">
            {diagram.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-dashed border-night/15 py-1.5 text-xs"
              >
                <dt className="font-semibold text-night/60">{row.label}</dt>
                <dd>
                  <bdi dir="ltr" className="font-code font-semibold">
                    {row.value}
                  </bdi>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <div className="relative flex flex-col items-center gap-1">
              <QrCode
                value={absoluteUrl(routes.warrantyShort(SAMPLE_CODE))}
                label={diagram.scanCaption}
                className="size-20 rounded-md ring-1 ring-night/10"
              />
              <span className="text-2xs font-bold text-night/60">{diagram.scanCaption}</span>
              <Pin locale={locale} value={2} />
            </div>
            <div className="relative flex flex-col gap-1 rounded-field bg-accent/15 px-3 py-2.5 ring-2 ring-accent">
              <span className="text-2xs font-bold text-night/60">{diagram.codeCaption}</span>
              <bdi dir="ltr" className="font-code text-base font-bold tracking-[0.12em] text-night">
                {formatWarrantyCode(SAMPLE_CODE)}
              </bdi>
              <Pin locale={locale} value={3} />
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
