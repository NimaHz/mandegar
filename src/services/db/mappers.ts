import { inArray } from "drizzle-orm";

import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { type guides, media } from "@/server/db/schema";
import type { LocalizedSeo } from "@/types/admin";
import type { DocumentAsset, ImageAsset, LocalizedText, SeoFields } from "@/types/common";

export type MediaRow = typeof media.$inferSelect;

type GuideMedia = Pick<typeof guides.$inferSelect, "video" | "steps">;

export const pick = (text: LocalizedText | null | undefined, locale: Locale) =>
  text ? text[locale] || text[locale === "fa" ? "en" : "fa"] : "";

export const pickOrNull = (text: LocalizedText | null | undefined, locale: Locale) =>
  pick(text, locale) || null;

export const pickExact = (text: LocalizedText | null | undefined, locale: Locale) =>
  text?.[locale] ?? "";

export const toImage = (
  row: MediaRow | null | undefined,
  locale: Locale,
  fallbackAlt = "",
): ImageAsset | null =>
  row?.kind === "image"
    ? {
        src: routes.upload(row.storageKey),
        alt: pickExact(row.alt, locale) || fallbackAlt,
        width: row.width ?? 0,
        height: row.height ?? 0,
      }
    : null;

export const toDocument = (row: MediaRow): DocumentAsset => ({
  href: routes.upload(row.storageKey),
  size: row.size,
  mime: row.mime,
});

export const toSeo = (seo: LocalizedSeo | null, locale: Locale): SeoFields => ({
  title: seo?.title[locale].trim() || null,
  description: seo?.description[locale].trim() || null,
});

export const iso = (date: Date) => date.toISOString();

export const isoOrNull = (date: Date | null) => date?.toISOString() ?? null;

export const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

export const clampLimit = (limit: number | undefined, fallback: number, max = 48) =>
  limit !== undefined && Number.isFinite(limit)
    ? Math.min(Math.max(0, Math.floor(limit)), max)
    : fallback;

export const mediaIndex = async (ids: readonly (string | null | undefined)[]) => {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map<string, MediaRow>();
  const rows = await getDb().select().from(media).where(inArray(media.id, unique));
  return new Map(rows.map((row) => [row.id, row]));
};

export const orderByIds = <TItem extends { id: string }>(
  ids: readonly string[],
  items: TItem[],
) => {
  const index = new Map(items.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = index.get(id);
    return item ? [item] : [];
  });
};

export const effectiveGuideId = (
  chain: readonly (string | null | undefined)[],
  published: ReadonlySet<string>,
) => chain.find((id): id is string => typeof id === "string" && published.has(id)) ?? null;

export const guideMediaIds = (row: GuideMedia) => [
  row.video?.posterMediaId,
  row.video?.kind === "upload" ? row.video.mediaId : null,
  ...row.steps.map((step) => step.mediaId),
];
