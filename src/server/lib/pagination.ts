import type { Paginated } from "@/types/common";

export const MAX_PAGE = 100_000;

export const clampPage = (page: number | undefined) =>
  page !== undefined && Number.isFinite(page) && page >= 1
    ? Math.min(Math.floor(page), MAX_PAGE)
    : 1;

export const offsetOf = (page: number, pageSize: number) => (page - 1) * pageSize;

export const toPaginated = <TItem>(
  items: TItem[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<TItem> => ({
  items,
  total,
  page,
  pageCount: Math.max(1, Math.ceil(total / pageSize)),
});
