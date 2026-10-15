import "server-only";

import { and, count, eq, ne } from "drizzle-orm";
import type { z } from "zod";

import { generateTemporaryPassword, hashPassword } from "@/server/auth/password";
import { revokeUserSessions } from "@/server/auth/sessions";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound, ValidationFailure } from "@/server/lib/http-error";
import type { AdminActor } from "@/server/plugins/auth";
import { usersAdmin } from "@/services/admin/system";

import type { userInputSchema, userPatchSchema } from "./schema";

const requireUser = async (id: string) => {
  const [row] = await getDb().select().from(users).where(eq(users.id, id));
  if (!row) throw notFound("User not found");
  return row;
};

const otherActiveOwners = async (id: string) => {
  const [row] = await getDb()
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.role, "owner"), eq(users.active, true), ne(users.id, id)));
  return row?.total ?? 0;
};

export const createUser = async (input: z.output<typeof userInputSchema>) => {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const [row] = await guardWrite(() =>
    getDb()
      .insert(users)
      .values({ ...input, passwordHash, mustChangePassword: true })
      .returning({ id: users.id }),
  );
  if (!row) throw new Error("User insert failed");
  return { user: orNotFound(await usersAdmin.get(row.id)), temporaryPassword };
};

export const updateUser = async (
  actor: AdminActor,
  id: string,
  patch: z.output<typeof userPatchSchema>,
) => {
  const before = await requireUser(id);
  const demoting = patch.role !== undefined && patch.role !== "owner";
  const deactivating = patch.active === false;
  if (id === actor.id && (demoting || deactivating)) {
    throw new ValidationFailure({
      [deactivating ? "active" : "role"]: "You cannot demote or deactivate yourself",
    });
  }
  if (
    before.role === "owner" &&
    (demoting || deactivating) &&
    (await otherActiveOwners(id)) === 0
  ) {
    throw new ValidationFailure({ role: "At least one active owner is required" });
  }
  await getDb().update(users).set(patch).where(eq(users.id, id));
  if (deactivating) await revokeUserSessions(id);
  return orNotFound(await usersAdmin.get(id));
};

export const resetUserPassword = async (actor: AdminActor, id: string) => {
  if (id === actor.id)
    throw new ValidationFailure({ id: "Change your own password from the account page" });
  await requireUser(id);
  const temporaryPassword = generateTemporaryPassword();
  await getDb()
    .update(users)
    .set({ passwordHash: await hashPassword(temporaryPassword), mustChangePassword: true })
    .where(eq(users.id, id));
  await revokeUserSessions(id);
  return { id, temporaryPassword };
};
