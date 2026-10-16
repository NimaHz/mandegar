import type { Metadata } from "next";

import { SettingsForms } from "@/features/admin/components/settings/settings-forms";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.settings.title };

export default async function AdminSettingsPage() {
  await requireAdmin("settings:write");
  const versions = await adminApi.settings.versions();
  const settings = await adminApi.settings.get();
  return <SettingsForms settings={settings} versions={versions} />;
}
