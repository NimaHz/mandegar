"use client";

import { themeBootScript } from "@/lib/theme";

export function ThemeBootScript() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "text/plain"}
      dangerouslySetInnerHTML={{ __html: themeBootScript }}
    />
  );
}
