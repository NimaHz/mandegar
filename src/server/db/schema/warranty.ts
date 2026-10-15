import { relations, sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { warrantyCodeKinds, warrantyCodeStatuses } from "@/types/admin";

import { products } from "./catalog";
import { id, localized, localizedList, timestamps, timestamptz } from "./columns";

export const warrantyCodeKind = pgEnum("warranty_code_kind", warrantyCodeKinds);
export const warrantyCodeStatus = pgEnum("warranty_code_status", warrantyCodeStatuses);

export const warrantyPolicies = pgTable("warranty_policies", {
  id: id(),
  name: text().notNull(),
  months: integer().notNull(),
  partsMonths: integer(),
  startRule: localized(),
  coverage: localizedList(),
  exclusions: localizedList(),
  effectiveFrom: date({ mode: "string" }).notNull(),
  ...timestamps,
});

export const warrantyCodes = pgTable(
  "warranty_codes",
  {
    id: id(),
    code: text().notNull().unique(),
    kind: warrantyCodeKind().notNull().default("batch"),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    productionYear: integer().notNull(),
    policyId: uuid()
      .notNull()
      .references(() => warrantyPolicies.id, { onDelete: "restrict" }),
    status: warrantyCodeStatus().notNull().default("active"),
    note: text(),
    issuedAt: timestamptz().notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("warranty_codes_batch_idx")
      .on(table.productId, table.productionYear)
      .where(sql`kind = 'batch'`),
    index("warranty_codes_product_idx").on(table.productId),
    index("warranty_codes_status_idx").on(table.status),
  ],
);

export const warrantyCodesRelations = relations(warrantyCodes, ({ one }) => ({
  product: one(products, { fields: [warrantyCodes.productId], references: [products.id] }),
  policy: one(warrantyPolicies, {
    fields: [warrantyCodes.policyId],
    references: [warrantyPolicies.id],
  }),
}));
