import { asc, desc, lte } from "drizzle-orm";

import type { Locale } from "@/i18n/config";
import { todayIsoDate } from "@/lib/dates";
import { formatWarrantyCode, parseWarrantyCode } from "@/lib/warranty-code";
import { getDb } from "@/server/db/client";
import { warrantyPolicies } from "@/server/db/schema";
import { type RateLimitRule, reserveAttempts } from "@/server/lib/rate-limit";
import type { WarrantyLookup, WarrantyMatch } from "@/types/warranty";

import type { WarrantyService } from "../contracts";
import { iso, pick, toImage } from "./mappers";

const NOT_FOUND: WarrantyLookup = { status: "not-found" };
const RATE_LIMITED: WarrantyLookup = { status: "rate-limited" };

const failureRules = (clientKey: string): RateLimitRule[] => [
  { key: `warranty-fail:minute:${clientKey}`, limit: 10, windowSec: 60 },
  { key: `warranty-fail:day:${clientKey}`, limit: 50, windowSec: 86_400 },
];

const findCode = (code: string) =>
  getDb().query.warrantyCodes.findFirst({
    where: (table, { eq }) => eq(table.code, code),
    with: {
      policy: true,
      product: {
        with: {
          category: true,
          brand: true,
          images: {
            orderBy: (image) => [desc(image.isPrimary), asc(image.sortOrder)],
            limit: 1,
            with: { media: true },
          },
        },
      },
    },
  });

type CodeRow = NonNullable<Awaited<ReturnType<typeof findCode>>>;

const isResolvable = ({ product }: CodeRow) => product.status !== "draft";

const isListed = ({ product }: CodeRow) =>
  product.status === "published" && product.category.published && product.brand.published;

const toMatch = (row: CodeRow, locale: Locale): WarrantyMatch => {
  const { product, policy } = row;
  const name = pick(product.name, locale);
  const [image] = product.images;
  return {
    code: formatWarrantyCode(row.code),
    status: row.status,
    productionYear: row.productionYear,
    months: policy.months,
    partsMonths: policy.partsMonths,
    startRule: pick(policy.startRule, locale),
    coverage: policy.coverage.map((item) => pick(item, locale)),
    exclusions: policy.exclusions.map((item) => pick(item, locale)),
    product: {
      slug: product.slug,
      name,
      modelCode: product.modelCode,
      listed: isListed(row),
      image: image ? toImage(image.media, locale, pick(image.alt, locale) || name) : null,
      category: {
        slug: product.category.slug,
        name: pick(product.category.name, locale),
        listed: product.category.published,
      },
      brand: {
        slug: product.brand.slug,
        name: pick(product.brand.name, locale),
        isOwn: product.brand.isOwn,
      },
    },
  };
};

export const warrantyService: WarrantyService = {
  lookup: async (locale, input, clientKey) => {
    const parsed = parseWarrantyCode(input);
    if (!parsed.valid && parsed.reason === "empty") return { status: "invalid", reason: "empty" };
    const attempt = await reserveAttempts(failureRules(clientKey));
    if (!attempt.allowed) return RATE_LIMITED;
    if (!parsed.valid) return { status: "invalid", reason: parsed.reason };
    const row = await findCode(parsed.code);
    if (!row || !isResolvable(row)) return NOT_FOUND;
    await attempt.release();
    return { status: "found", match: toMatch(row, locale) };
  },
  policies: async (locale) => {
    const rows = await getDb()
      .select()
      .from(warrantyPolicies)
      .where(lte(warrantyPolicies.effectiveFrom, todayIsoDate()))
      .orderBy(desc(warrantyPolicies.months), asc(warrantyPolicies.name));
    return rows.map((row) => ({
      name: row.name,
      months: row.months,
      partsMonths: row.partsMonths,
      startRule: pick(row.startRule, locale),
      coverage: row.coverage.map((item) => pick(item, locale)),
      exclusions: row.exclusions.map((item) => pick(item, locale)),
      updatedAt: iso(row.updatedAt),
    }));
  },
};
