import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { absoluteUrl, siteUrl } from "@/lib/seo/urls";

const filterParams = ["q", "sort", "category", "brand", "energy", "kind", "code", "t"];

const privatePaths = [routes.track, routes.compare, routes.offline];

const disallow = [
  "/admin",
  "/api/",
  "/w/",
  ...locales.flatMap((locale) => privatePaths.map((path) => localizePath(locale, path))),
  ...filterParams.flatMap((param) => [`/*?${param}=`, `/*&${param}=`]),
];

const allowedAgents = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot",
  "Applebot-Extended",
  "Google-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...allowedAgents.map((userAgent) => ({ userAgent, allow: "/", disallow })),
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
