import { type SQL, sql } from "drizzle-orm";

import { toSearchKey } from "@/lib/persian";

const FOLD_FROM = "يىكةأإآ۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩";
const FOLD_TO = "ییکهااا01234567890123456789";
const FOLD_STRIP =
  "[\\u0009-\\u000d\\u0020\\u00a0\\u0640\\u064b-\\u065f\\u0670\\u1680\\u2000-\\u200a\\u200c\\u200e\\u200f\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff-]";

export const foldSearch = (expression: SQL) =>
  sql`regexp_replace(translate(lower(${expression}), ${sql.raw(`'${FOLD_FROM}'`)}, ${sql.raw(`'${FOLD_TO}'`)}), ${sql.raw(`'${FOLD_STRIP}'`)}, '', 'g')`;

export const toFoldedKey = (value: string) => toSearchKey(value).replace(/-/g, "");

export const likePattern = (key: string) =>
  `%${key.replace(/[\\%_]/g, (symbol) => `\\${symbol}`)}%`;
