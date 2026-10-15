import type { Paginated } from "@/types/common";

export const clampPage = (page: number | undefined) =>
  page !== undefined && Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

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
