import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { faqs } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { revalidateContent } from "@/server/lib/revalidate";
import { faqsAdmin } from "@/services/admin/content";

import type { faqInputSchema, faqPatchSchema } from "./schema";

const revalidateFaqs = () =>
  revalidateContent(
    [cacheTags.faqs],
    [routes.home, routes.faq, routes.warranty, routes.support, routes.serviceRequest],
  );

export const createFaq = async (input: z.output<typeof faqInputSchema>) => {
  const [row] = await guardWrite(() =>
    getDb().insert(faqs).values(input).returning({ id: faqs.id }),
  );
  if (!row) throw new Error("FAQ insert failed");
  revalidateFaqs();
  return orNotFound(await faqsAdmin.get(row.id));
};

export const updateFaq = async (id: string, patch: z.output<typeof faqPatchSchema>) => {
  const [row] = await guardWrite(() =>
    getDb().update(faqs).set(patch).where(eq(faqs.id, id)).returning({ id: faqs.id }),
  );
  if (!row) throw notFound("FAQ not found");
  revalidateFaqs();
  return orNotFound(await faqsAdmin.get(id));
};

export const deleteFaq = async (id: string) => {
  const [row] = await getDb().delete(faqs).where(eq(faqs.id, id)).returning({ id: faqs.id });
  if (!row) throw notFound("FAQ not found");
  revalidateFaqs();
  return { id };
};
