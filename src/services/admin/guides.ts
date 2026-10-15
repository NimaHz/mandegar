import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { guides } from "@/server/db/schema";
import type { AdminGuide, AdminGuideListItem, AdminListQuery, AdminOption } from "@/types/admin";

import { iso, isoOrNull, mediaRefs, paginate, searchColumns } from "./shared";

type GuideRow = typeof guides.$inferSelect;

const toListItem = (row: GuideRow): AdminGuideListItem => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  published: row.published,
  stepCount: row.steps.length,
  videoKind: row.video?.kind ?? null,
  publishedAt: isoOrNull(row.publishedAt),
  updatedAt: iso(row.updatedAt),
});

const guideMediaIds = (row: GuideRow) => [
  row.video?.posterMediaId,
  row.video?.kind === "upload" ? row.video.mediaId : null,
  ...row.steps.map((step) => step.mediaId),
];

export const guidesAdmin = {
  list: async (query: Partial<AdminListQuery & { published: boolean | null }> = {}) => {
    const where = and(
      searchColumns(query.q, { localized: [guides.title], text: [guides.slug] }),
      typeof query.published === "boolean" ? eq(guides.published, query.published) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(guides).where(where),
      (limit, offset) =>
        getDb()
          .select()
          .from(guides)
          .where(where)
          .orderBy(desc(guides.updatedAt))
          .limit(limit)
          .offset(offset),
      (rows) => rows.map(toListItem),
    );
  },
  get: async (id: string): Promise<AdminGuide | null> => {
    const [row] = await getDb().select().from(guides).where(eq(guides.id, id));
    if (!row) return null;
    return {
      ...row,
      publishedAt: isoOrNull(row.publishedAt),
      createdAt: iso(row.createdAt),
      updatedAt: iso(row.updatedAt),
      media: await mediaRefs(guideMediaIds(row)),
    };
  },
  options: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select({
        id: guides.id,
        slug: guides.slug,
        title: guides.title,
        published: guides.published,
      })
      .from(guides)
      .orderBy(desc(guides.updatedAt));
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      label: row.title,
      hint: row.published ? null : "draft",
    }));
  },
};
