import type { Metadata } from "next";

import { SlidesBoard } from "@/features/admin/components/slides/slides-board";
import { adminContent } from "@/features/admin/content";
import { getRequestTime } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.slides.title };

export default async function AdminSlidesPage() {
  const { permissions } = await requireAdmin("content:read");
  const result = await adminApi.slides.list({ page: 1 });
  return (
    <SlidesBoard
      key={result.items.map((slide) => `${slide.id}:${slide.updatedAt}`).join("|")}
      slides={result.items}
      canWrite={permissions.includes("content:write")}
      now={getRequestTime()}
    />
  );
}
