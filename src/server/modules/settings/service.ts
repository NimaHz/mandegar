import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { settings } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { assertUnchanged } from "@/server/lib/concurrency";
import { revalidateContent } from "@/server/lib/revalidate";
import { settingsAdmin } from "@/services/admin/system";
import type { SettingKey, SettingsValues } from "@/types/admin";

export const readSetting = async <TKey extends SettingKey>(key: TKey) => {
  const versions = await settingsAdmin.versions();
  const values = await settingsAdmin.get();
  return { value: values[key], updatedAt: versions[key] };
};

export const saveSetting = async <TKey extends SettingKey>(
  key: TKey,
  value: SettingsValues[TKey],
  expectedUpdatedAt?: string,
) => {
  await getDb().transaction(async (tx) => {
    const [current] = await tx
      .select({ updatedAt: settings.updatedAt })
      .from(settings)
      .where(eq(settings.key, key))
      .for("update");
    if (current) assertUnchanged(current.updatedAt, expectedUpdatedAt);
    await tx
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  });
  revalidateContent([cacheTags.settings]);
  return readSetting(key);
};
