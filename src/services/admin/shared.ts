import { type AnyColumn, inArray, or, type SQL, sql } from "drizzle-orm";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { media } from "@/server/db/schema";
import { foldSearch, likePattern, toFoldedKey } from "@/server/db/search";
import { clampPage, offsetOf, toPaginated } from "@/server/lib/pagination";
import type { AdminMediaRef } from "@/types/admin";
import type { Paginated } from "@/types/common";

const ADMIN_PAGE_SIZE = 20;

export type MediaRow = typeof media.$inferSelect;

export const toMediaRef = (row: MediaRow): AdminMediaRef => ({
  id: row.id,
  kind: row.kind,
  url: routes.upload(row.storageKey),
  mime: row.mime,
  width: row.width,
  height: row.height,
  alt: row.alt,
});

export const toMediaRefOrNull = (row: MediaRow | null | undefined) =>
  row ? toMediaRef(row) : null;

export const mediaRefs = async (ids: readonly (string | null | undefined)[]) => {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return {};
  const rows = await getDb().select().from(media).where(inArray(media.id, unique));
  return Object.fromEntries(rows.map((row) => [row.id, toMediaRef(row)]));
};

export const iso = (date: Date) => date.toISOString();

export const isoOrNull = (date: Date | null) => date?.toISOString() ?? null;

export const searchColumns = (
  q: string | undefined,
  columns: { localized?: AnyColumn[]; text?: AnyColumn[] },
): SQL | undefined => {
  const key = q ? toFoldedKey(q) : "";
  if (!key) return undefined;
  const pattern = likePattern(key);
  return or(
    ...(columns.localized ?? []).map(
      (column) =>
        sql`${foldSearch(sql`(${column}->>'fa') || ' ' || (${column}->>'en')`)} like ${pattern}`,
    ),
    ...(columns.text ?? []).map(
      (column) => sql`${foldSearch(sql`coalesce(${column}, '')`)} like ${pattern}`,
    ),
  );
};

export const paginate = async <TRow, TItem>(
  page: number | undefined,
  total: () => Promise<{ total: number }[]>,
  rows: (limit: number, offset: number) => Promise<TRow[]>,
  map: (rows: TRow[]) => TItem[] | Promise<TItem[]>,
): Promise<Paginated<TItem>> => {
  const [counted] = await total();
  const totalCount = counted?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));
  const current = Math.min(clampPage(page), pageCount);
  const items = await map(await rows(ADMIN_PAGE_SIZE, offsetOf(current, ADMIN_PAGE_SIZE)));
  return toPaginated(items, totalCount, current, ADMIN_PAGE_SIZE);
};
