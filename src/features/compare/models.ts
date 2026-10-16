import { slugSchema } from "@/server/lib/validation";
import { COMPARE_LIMIT } from "@/types/catalog";

export const parseModels = (raw: string | string[] | undefined) => {
  const values = (Array.isArray(raw) ? raw.join(",") : (raw ?? ""))
    .split(",")
    .map((value) => slugSchema.safeParse(value))
    .flatMap((parsed) => (parsed.success ? [parsed.data] : []));
  return [...new Set(values)].slice(0, COMPARE_LIMIT);
};
