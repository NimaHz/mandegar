import { asc, desc, lte } from "drizzle-orm";

import type { Locale } from "@/i18n/config";
import { formatWarrantyCode, parseWarrantyCode } from "@/lib/warranty-code";
import { getDb } from "@/server/db/client";
import { warrantyPolicies } from "@/server/db/schema";
import { isRateLimited, rateLimit } from "@/server/lib/rate-limit";
import type { WarrantyLookup, WarrantyMatch } from "@/types/warranty";

import type { WarrantyService } from "../contracts";
import { pick, toImage } from "./mappers";

const FAILURE_WINDOWS = [
  { scope: "minute", limit: 10, windowSec: 60 },
  { scope: "day", limit: 50, windowSec: 86_400 },
] as const;

const NOT_FOUND: WarrantyLookup = { status: "not-found" };
const RATE_LIMITED: WarrantyLookup = { status: "rate-limited" };

const failureKey = (scope: string, clientKey: string) => `warranty-fail:${scope}:${clientKey}`;

const isBlocked = async (clientKey: string) =>
  (
    await Promise.all(
      FAILURE_WINDOWS.map((window) =>
        isRateLimited(failureKey(window.scope, clientKey), window.limit, window.windowSec),
      ),
    )
  ).some(Boolean);

const recordFailure = async (clientKey: string) => {
  await Promise.all(
    FAILURE_WINDOWS.map((window) =>
      rateLimit(failureKey(window.scope, clientKey), window.limit, window.windowSec),
    ),
  );
};

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

const isListed = ({ product }: CodeRow) =>
  product.status !== "draft" && product.category.published && product.brand.published;

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
      image: image ? toImage(image.media, locale, pick(image.alt, locale) || name) : null,
      category: { slug: product.category.slug, name: pick(product.category.name, locale) },
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
    if (await isBlocked(clientKey)) return RATE_LIMITED;
    const parsed = parseWarrantyCode(input);
    if (!parsed.valid) {
      if (parsed.reason !== "empty") await recordFailure(clientKey);
      return { status: "invalid", reason: parsed.reason };
    }
    const row = await findCode(parsed.code);
    if (!row || !isListed(row)) {
      await recordFailure(clientKey);
      return NOT_FOUND;
    }
    return { status: "found", match: toMatch(row, locale) };
  },
  policies: async (locale) => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await getDb()
      .select()
      .from(warrantyPolicies)
      .where(lte(warrantyPolicies.effectiveFrom, today))
      .orderBy(desc(warrantyPolicies.months), asc(warrantyPolicies.name));
    return rows.map((row) => ({
      name: row.name,
      months: row.months,
      partsMonths: row.partsMonths,
      startRule: pick(row.startRule, locale),
      coverage: row.coverage.map((item) => pick(item, locale)),
      exclusions: row.exclusions.map((item) => pick(item, locale)),
    }));
  },
};
