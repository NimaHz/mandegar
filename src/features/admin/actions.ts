"use server";

import { renderMarkdown } from "@/components/shared/markdown";
import { requireAdmin } from "@/server/auth/session";

const MAX_PREVIEW = 60_000;

export async function previewMarkdown(source: string) {
  await requireAdmin();
  return renderMarkdown(source.slice(0, MAX_PREVIEW));
}
