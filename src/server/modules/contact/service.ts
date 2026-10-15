import "server-only";

import type { z } from "zod";

import { getDb } from "@/server/db/client";
import { contactMessages } from "@/server/db/schema";
import { assertHuman } from "@/server/lib/form-guard";
import { enforceRateLimit } from "@/server/lib/rate-limit";

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
