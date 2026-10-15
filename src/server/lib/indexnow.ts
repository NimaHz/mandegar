import "server-only";

import { locales } from "@/i18n/config";
import { absoluteUrl, localeUrl, siteUrl } from "@/lib/seo/urls";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 5000;
const MAX_URLS = 10_000;
const KEY_PATTERN = /^[a-zA-Z0-9-]{8,128}$/;

const indexNowKey = () => {
  const key = process.env.INDEXNOW_KEY?.trim();
  return process.env.INDEXNOW_ENABLED === "true" && key && KEY_PATTERN.test(key) ? key : null;
};

const pingIndexNow = async (urls: readonly string[]): Promise<boolean> => {
  try {
    const key = indexNowKey();
    const urlList = [...new Set(urls)].slice(0, MAX_URLS);
    if (!key || urlList.length === 0) return false;
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key,
        keyLocation: absoluteUrl(`/${key}.txt`),
        urlList,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok;
  } catch (error) {
    console.error("IndexNow ping failed", error);
    return false;
  }
};

export const pingIndexNowPaths = (paths: readonly string[]) =>
  pingIndexNow(paths.flatMap((path) => locales.map((locale) => localeUrl(locale, path))));
