import { type AdminOption, type AdminSort, type AdminSortEntity, adminSorts } from "@/types/admin";
import type { Option } from "@/types/common";

import { adminContent } from "../content";

export const toOptions = (items: readonly AdminOption[], withHint = false): Option[] =>
  items.map((item) => ({
    value: item.id,
    label: withHint && item.hint ? `${item.label.fa} · ${item.hint}` : item.label.fa,
  }));

export const enumOptions = <TValue extends string>(
  labels: Record<TValue, string>,
): Option<TValue>[] =>
  (Object.keys(labels) as TValue[]).map((value) => ({ value, label: labels[value] }));

export const sortOptions = (entity: AdminSortEntity): Option<AdminSort>[] => {
  const values: readonly AdminSort[] = adminSorts[entity];
  return values.map((value) => ({ value, label: adminContent.sorts[value] }));
};
