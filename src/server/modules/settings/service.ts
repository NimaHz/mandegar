import "server-only";

import { getDb } from "@/server/db/client";
import { settings } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { revalidateContent } from "@/server/lib/revalidate";
import { settingsAdmin } from "@/services/admin/system";
import type { SettingKey, SettingsValues } from "@/types/admin";

export const saveSetting = async <TKey extends SettingKey>(
  key: TKey,
  value: SettingsValues[TKey],
) => {
  await getDb()
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  revalidateContent([cacheTags.settings]);
  return (await settingsAdmin.get())[key];
};
