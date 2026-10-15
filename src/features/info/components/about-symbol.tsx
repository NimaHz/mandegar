import { LOGO_MARK_TILES, logoMarkFill } from "@/components/brand/logo-mark";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Locale } from "@/i18n/config";

import { aboutContent } from "../content";

const turningCentres = [
  [9.8, 17.6],
  [30.4, 9.8],
  [38.2, 30.4],
  [17.6, 38.2],
] as const;

function SymbolKey({ active }: { active: number }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="size-11 shrink-0">
      {LOGO_MARK_TILES.map((tile, index) => (
        <path
          key={tile.tone}
          d={tile.d}
          className={index === active ? logoMarkFill[tile.tone] : "fill-line"}
        />
      ))}
    </svg>
  );
}

export function AboutSymbol({ locale }: { locale: Locale }) {
  const { symbol } = aboutContent[locale];

  return (
    <section aria-labelledby="about-symbol" className="container-page">
      <div className="grid overflow-hidden panel bg-raised lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <figure className="bg-dots relative grid place-items-center border-line bg-sunken p-10 max-lg:border-b sm:p-14 lg:border-e">
          <svg
            viewBox="-6 -6 60 60"
            role="img"
            aria-label={symbol.figureLabel}
            className="size-64 sm:size-80"
          >
            <g
              fill="none"
              strokeWidth={0.12}
              strokeDasharray="0.7 0.7"
              className="stroke-line-strong"
            >
              <path d="M24-6V54M-6 24H54" />
              <rect x={4} y={4} width={40} height={40} rx={2.2} />
              {turningCentres.map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={13.6} />
              ))}
            </g>
            {LOGO_MARK_TILES.map((tile) => (
              <path key={tile.tone} d={tile.d} className={logoMarkFill[tile.tone]} />
            ))}
          </svg>
        </figure>
        <div className="flex flex-col gap-9 p-7 sm:p-10 lg:p-14">
          <div className="flex flex-col items-start gap-4">
            <p className="eyebrow">{symbol.eyebrow}</p>
            <h2
              id="about-symbol"
              className="font-display text-[1.875rem] leading-snug font-black text-balance text-ink sm:text-[2.5rem]"
            >
              {symbol.title}
            </h2>
            <p className="text-lead leading-8 text-pretty text-body sm:text-base sm:leading-9">
              {symbol.description}
            </p>
          </div>
          <RevealGroup className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {symbol.items.map((item, index) => (
              <RevealItem key={item.title} className="flex gap-4">
                <SymbolKey active={index} />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3 className="font-display text-lg font-black text-ink">{item.title}</h3>
                  <p className="text-sm leading-7 text-pretty text-body">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
