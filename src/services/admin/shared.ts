import { type AnyColumn, asc, eq, inArray, or, type SQL, sql } from "drizzle-orm";

import { normalizeMobile } from "@/lib/persian";
import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { media } from "@/server/db/schema";
import { foldSearch, likePattern, toFoldedKey } from "@/server/db/search";
import { clampPage, offsetOf, toPaginated } from "@/server/lib/pagination";
import type { AdminMediaRef } from "@/types/admin";
import type { Paginated } from "@/types/common";

import type { MediaRow } from "../db/mappers";

const ADMIN_PAGE_SIZE = 20;

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

export const searchColumns = (
  q: string | undefined,
  columns: { localized?: AnyColumn[]; text?: AnyColumn[]; mobile?: AnyColumn[] },
): SQL | undefined => {
  const key = q ? toFoldedKey(q) : "";
  if (!key) return undefined;
  const pattern = likePattern(key);
  const mobile = q ? normalizeMobile(q) : null;
  return or(
    ...(mobile ? (columns.mobile ?? []).map((column) => eq(column, mobile)) : []),
    ...(columns.localized ?? []).map(
      (column) =>
        sql`${foldSearch(sql`(${column}->>'fa') || ' ' || (${column}->>'en')`)} like ${pattern}`,
    ),
    ...(columns.text ?? []).map(
      (column) => sql`${foldSearch(sql`coalesce(${column}, '')`)} like ${pattern}`,
    ),
  );
};

export const collated = (value: AnyColumn | SQL) => sql`${value} collate "fa-x-icu"`;

export const collatedName = (column: AnyColumn) => sql`(${column}->>'fa') collate "fa-x-icu"`;

export const sortedBy = <TSort extends string>(
  orders: Record<TSort, SQL[]>,
  sort: TSort,
  id: AnyColumn,
) => [...orders[sort], asc(id)];

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
