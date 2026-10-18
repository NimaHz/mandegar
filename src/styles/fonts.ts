import localFont from "next/font/local";

import { cn } from "@/lib/cn";

export const vazirmatn = localFont({
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "system-ui", "sans-serif"],
  src: [{ path: "../assets/fonts/vazirmatn/vazirmatn-web.woff2", weight: "400 900" }],
});

export const estedad = localFont({
  variable: "--font-estedad",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "system-ui", "sans-serif"],
  src: [{ path: "../assets/fonts/estedad/estedad-web.woff2", weight: "700 900" }],
});

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
      path: "../assets/fonts/jetbrains-mono/jetbrains-mono-web.woff2",
      weight: "400 700",
    },
  ],
});

export const fontVariables = cn(
  vazirmatn.variable,
  estedad.variable,
  kufam.variable,
  jetbrainsMono.variable,
);
