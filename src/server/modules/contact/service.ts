import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { getDb } from "@/server/db/client";
import { contactMessages } from "@/server/db/schema";
import { assertHuman } from "@/server/lib/form-guard";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { enforceRateLimit } from "@/server/lib/rate-limit";
import { messagesAdmin } from "@/services/admin/messages";
import type { ContactStatus } from "@/types/admin";

import type { contactRequestSchema } from "./schema";

export const submitContact = async (
  input: z.output<typeof contactRequestSchema>,
  clientKey: string,
): Promise<{ received: true }> => {
  await assertHuman(input);
  await enforceRateLimit(`contact:${clientKey}`, 5, 3600);
  await getDb()
    .insert(contactMessages)
    .values({
      department: input.department,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      subject: input.subject,
      body: input.body,
      ipHash: clientKey,
    });
  return { received: true };
};

export const setMessageStatus = async (id: string, status: ContactStatus) => {
  const [row] = await getDb()
    .update(contactMessages)
    .set({ status })
    .where(eq(contactMessages.id, id))
    .returning({ id: contactMessages.id });
  if (!row) throw notFound("Message not found");
  return orNotFound(await messagesAdmin.get(id));
};

export const deleteMessage = async (id: string) => {
  const [row] = await getDb()
    .delete(contactMessages)
    .where(eq(contactMessages.id, id))
    .returning({ id: contactMessages.id });
  if (!row) throw notFound("Message not found");
  return { id };
};
