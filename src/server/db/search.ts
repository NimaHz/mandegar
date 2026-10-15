import { type SQL, sql } from "drizzle-orm";

import { toSearchKey } from "@/lib/persian";

const FOLD_FROM = "يىكةأإآ۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩ ـ-";
const FOLD_TO = "ییکهااا01234567890123456789";

export const foldSearch = (expression: SQL) =>
  sql`translate(lower(${expression}), ${sql.raw(`'${FOLD_FROM}'`)} || chr(8204), ${sql.raw(`'${FOLD_TO}'`)})`;

export const toFoldedKey = (value: string) => toSearchKey(value).replace(/-/g, "");

export const likePattern = (key: string) =>
  `%${key.replace(/[\\%_]/g, (symbol) => `\\${symbol}`)}%`;
