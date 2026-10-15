import { createElement } from "react";

import { LOGO_MARK_PATHS } from "@/components/brand/logo-mark";
import { type Locale, localeMeta } from "@/i18n/config";

import { ogPalette } from "./palette";
import { OG_HEIGHT, OG_WIDTH } from "./targets";

export interface OgCard {
  locale: Locale;
  brand: string;
  kicker: string;
  title: string;
  subtitle: string | null;
  code: string | null;
  meta: string[];
  image: string | null;
  host: string;
}

const IMAGE_SIZE = 400;
const IMAGE_PANEL = 470;

const SHORT_TITLE = 28;
const LONG_TITLE = 44;

const titleSize = (title: string, compact: boolean) => {
  if (compact) return title.length <= 22 ? 68 : title.length <= LONG_TITLE ? 54 : 48;
  return title.length <= 22 ? 80 : title.length <= LONG_TITLE ? 66 : title.length <= 72 ? 56 : 48;
};

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path d={LOGO_MARK_PATHS.warm} fill={ogPalette.warm} />
      <path d={LOGO_MARK_PATHS.cool} fill={ogPalette.cool} />
    </svg>
  );
}

function Wave() {
  return (
    <svg
      width={OG_WIDTH}
      height={140}
      viewBox={`0 0 ${OG_WIDTH} 140`}
      style={{ position: "absolute", left: 0, bottom: 0 }}
    >
      <path
        d="M0 78C200 46 400 46 600 74C800 102 1000 106 1200 70V140H0Z"
        fill={ogPalette.waveCool}
      />
      <path
        d="M0 104C220 82 420 84 620 102C820 120 1020 122 1200 102V140H0Z"
        fill={ogPalette.waveWarm}
      />
    </svg>
  );
}

function Chip({ children, ltr = false }: { children: string; ltr?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        direction: ltr ? "ltr" : undefined,
        fontSize: ltr ? 30 : 26,
        fontWeight: ltr ? 800 : 500,
        letterSpacing: ltr ? 1 : 0,
        padding: "8px 20px",
        borderRadius: 14,
        backgroundColor: ogPalette.chip,
        border: `2px solid ${ogPalette.chipLine}`,
      }}
    >
      {children}
    </div>
  );
}

export function OgCardView({ card }: { card: OgCard }) {
  const { dir } = localeMeta[card.locale];
  const compact = Boolean(card.image);
  const corner = dir === "rtl" ? "100% 0%" : "0% 0%";
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        direction: dir,
        position: "relative",
        backgroundColor: ogPalette.deep,
        backgroundImage: `radial-gradient(circle at ${corner}, ${ogPalette.glow}, ${ogPalette.fade} 62%)`,
        color: ogPalette.ink,
        fontFamily: "Vazirmatn",
      }}
    >
      <Wave />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          padding: "56px 72px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Mark size={60} />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 800 }}>{card.brand}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: ogPalette.warm }}>
            {card.kicker}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titleSize(card.title, compact),
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            {card.title}
          </div>
          {card.subtitle && !(compact && card.title.length > SHORT_TITLE) && (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 500,
                lineHeight: 1.55,
                color: ogPalette.soft,
              }}
            >
              {card.subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {card.code && <Chip ltr>{card.code}</Chip>}
            {card.meta.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
          {!compact && (
            <div style={{ display: "flex", direction: "ltr", fontSize: 24, color: ogPalette.soft }}>
              {card.host}
            </div>
          )}
        </div>
      </div>
      {card.image && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: IMAGE_PANEL,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: 40,
              overflow: "hidden",
              backgroundColor: ogPalette.card,
              border: `4px solid ${ogPalette.chipLine}`,
            }}
          >
            {createElement("img", {
              src: card.image,
              alt: "",
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              style: { width: IMAGE_SIZE, height: IMAGE_SIZE, objectFit: "cover" },
            })}
          </div>
        </div>
      )}
    </div>
  );
}
