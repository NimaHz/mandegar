import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuideEditor } from "@/features/admin/components/guides/guide-editor";
import { adminContent } from "@/features/admin/content";
import { hasAdminPermission, requireAdmin } from "@/server/auth/session";
import { idSchema } from "@/server/lib/validation";
import { adminApi } from "@/services/admin";

export async function generateMetadata({
  params,
}: PageProps<"/admin/guides/[id]">): Promise<Metadata> {
  const { id } = await params;
  const guide =
    idSchema.safeParse(id).success && (await hasAdminPermission("content:read"))
      ? await adminApi.guides.get(id)
      : null;
  return { title: guide?.title.fa ?? adminContent.guides.title };
}

export default async function AdminGuidePage({ params }: PageProps<"/admin/guides/[id]">) {
  const { permissions } = await requireAdmin("content:read");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const guide = await adminApi.guides.get(id);
  if (!guide) notFound();
  return (
    <GuideEditor key={guide.id} guide={guide} canWrite={permissions.includes("content:write")} />
  );
}
