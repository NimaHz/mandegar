import { COMPARE_LIMIT } from "@/types/catalog";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const parseModels = (raw: string | string[] | undefined) => {
  const values = (Array.isArray(raw) ? raw.join(",") : (raw ?? ""))
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => SLUG.test(value) && value.length <= 80);
  return [...new Set(values)].slice(0, COMPARE_LIMIT);
};
