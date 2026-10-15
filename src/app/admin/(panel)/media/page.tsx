import type { Metadata } from "next";

import { MediaLibrary } from "@/features/admin/components/media/media-library";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { mediaQuerySchema } from "@/server/modules/media/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.media.title };

export default async function AdminMediaPage({ searchParams }: PageProps<"/admin/media">) {
  const { permissions } = await requireAdmin("media:read");
  const params = await searchParams;
  const result = await adminApi.media.list(mediaQuerySchema.parse(params));
  return (
    <MediaLibrary
      result={result}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("media:write")}
    />
  );
}
