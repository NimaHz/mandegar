import type { Metadata } from "next";

import { LabelSheet } from "@/features/admin/components/warranty/label-sheet";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";
import { warrantyLabelsQuerySchema } from "@/server/modules/warranty/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.warranty.labels.title };

export default async function AdminWarrantyLabelsPage({
  searchParams,
}: PageProps<"/admin/warranty/labels">) {
  await requireAdmin("warranty:read");
  const { ids } = await searchParams;
  const parsed = warrantyLabelsQuerySchema.safeParse({ ids: typeof ids === "string" ? ids : "" });
  const codes = parsed.success ? await adminApi.warrantyCodes.byIds(parsed.data.ids) : [];

  return <LabelSheet codes={codes} />;
}
