"use client";

import { themeBootScript } from "@/lib/theme";

// The boot script only has to run from the server HTML, before first paint. React never
// executes scripts it creates on the client and warns about them, so a client render of the
// root layout gets an inert data block instead; ThemeColor re-applies the theme in that case.
export function ThemeBootScript() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "text/plain"}
      dangerouslySetInnerHTML={{ __html: themeBootScript }}
    />
  );
}
