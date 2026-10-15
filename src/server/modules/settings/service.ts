import "server-only";

import { getDb } from "@/server/db/client";
import { settings } from "@/server/db/schema";
import { revalidateSite } from "@/server/lib/revalidate";
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
  revalidateSite();
  return (await settingsAdmin.get())[key];
};
