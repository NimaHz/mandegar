"use client";

import { useTheme } from "@/hooks/use-theme";
import { DARK_QUERY, LIGHT_QUERY, THEME_COLORS } from "@/lib/theme";

export function ThemeColor() {
  const { preference } = useTheme();

  if (preference !== "system")
    return <meta name="theme-color" content={THEME_COLORS[preference]} />;

  return (
    <>
      <meta name="theme-color" media={LIGHT_QUERY} content={THEME_COLORS.light} />
      <meta name="theme-color" media={DARK_QUERY} content={THEME_COLORS.dark} />
    </>
  );
}
