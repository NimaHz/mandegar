import type { MetadataRoute } from "next";

import { pwaContent } from "@/components/pwa/content";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";
import { THEME_COLORS } from "@/lib/theme";

const shortcutIcons = [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }];

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [fa, en] = await Promise.all([getDictionary("fa"), getDictionary("en")]);
  const { screenshots } = pwaContent.fa;

  return {
    id: "/",
    name: `${fa.site.name} | ${fa.site.slogan}`,
    short_name: fa.site.name,
    description: `${fa.site.description} (${en.site.name})`,
    lang: "fa",
    dir: "rtl",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    launch_handler: { client_mode: ["navigate-existing", "auto"] },
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    categories: ["shopping", "lifestyle", "utilities"],
    prefer_related_applications: false,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: fa.nav.warranty, url: routes.warranty, icons: shortcutIcons },
      { name: fa.nav.serviceRequest, url: routes.serviceRequest, icons: shortcutIcons },
      { name: fa.nav.track, url: routes.track, icons: shortcutIcons },
      { name: fa.nav.allProducts, url: routes.products, icons: shortcutIcons },
    ],
    screenshots: [
      {
        src: "/screenshots/home-narrow.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: screenshots.narrow,
      },
      {
        src: "/screenshots/home-wide.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: screenshots.wide,
      },
    ],
  };
}
