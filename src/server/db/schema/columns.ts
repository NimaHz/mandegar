import { jsonb, pgEnum, timestamp, uuid } from "drizzle-orm/pg-core";

import { uuidv7 } from "@/server/lib/ids";
import { contentStatuses } from "@/types/admin";
import type { LocalizedText } from "@/types/common";

export const contentStatus = pgEnum("content_status", contentStatuses);

export const id = () => uuid().primaryKey().$defaultFn(uuidv7);

export const localized = () => jsonb().$type<LocalizedText>().notNull();

export const localizedList = () => jsonb().$type<LocalizedText[]>().notNull().default([]);

export const timestamptz = () => timestamp({ withTimezone: true });

export const timestamps = {
  createdAt: timestamptz().notNull().defaultNow(),
  updatedAt: timestamptz()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
