import localFont from "next/font/local";

import { cn } from "@/lib/cn";

export const vazirmatn = localFont({
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "system-ui", "sans-serif"],
  src: [{ path: "../assets/fonts/vazirmatn/vazirmatn-variable.woff2", weight: "100 900" }],
});

export const estedad = localFont({
  variable: "--font-estedad",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "system-ui", "sans-serif"],
  src: [{ path: "../assets/fonts/estedad/estedad-variable.woff2", weight: "100 900" }],
});

// Kufam only sets the wordmark, so it ships just those glyphs (7 KB instead of 44 KB).
// Regenerate when siteConfig.name or latinName changes:
// pyftsubset src/assets/fonts/kufam/kufam-extrabold.woff2 --text="ماندگار Mandegar MANDEGAR" \
//   --layout-features='*' --flavor=woff2 --output-file=src/assets/fonts/kufam/kufam-logo.woff2
export const kufam = localFont({
  variable: "--font-kufam",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "system-ui", "sans-serif"],
  src: [{ path: "../assets/fonts/kufam/kufam-logo.woff2", weight: "800" }],
});

export const jetbrainsMono = localFont({
  variable: "--font-mono-code",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
  src: [
    {
      path: "../assets/fonts/jetbrains-mono/jetbrains-mono-latin-variable.woff2",
      weight: "100 800",
    },
  ],
});

export const fontVariables = cn(
  vazirmatn.variable,
  estedad.variable,
  kufam.variable,
  jetbrainsMono.variable,
);
