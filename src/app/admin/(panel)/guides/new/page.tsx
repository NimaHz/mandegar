import type { Metadata } from "next";

import { GuideEditor } from "@/features/admin/components/guides/guide-editor";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: adminContent.guides.createTitle };

export default async function AdminNewGuidePage() {
  await requireAdmin("content:write");
  return <GuideEditor guide={null} canWrite />;
}
