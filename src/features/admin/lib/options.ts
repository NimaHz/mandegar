import type { AdminOption } from "@/types/admin";
import type { Option } from "@/types/common";

export const toOptions = (items: readonly AdminOption[], withHint = false): Option[] =>
  items.map((item) => ({
    value: item.id,
    label: withHint && item.hint ? `${item.label.fa} · ${item.hint}` : item.label.fa,
  }));

export const enumOptions = <TValue extends string>(
  labels: Record<TValue, string>,
): Option<TValue>[] =>
  (Object.keys(labels) as TValue[]).map((value) => ({ value, label: labels[value] }));
