import "server-only";

import { and, eq, notInArray } from "drizzle-orm";
import type { z } from "zod";

import { generateTemporaryPassword, hashPassword } from "@/server/auth/password";
import { hasPermission } from "@/server/auth/permissions";
import { revokeUserSessions } from "@/server/auth/sessions";
import { type Executor, getDb } from "@/server/db/client";
import { tickets, users } from "@/server/db/schema";
import { guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound, ValidationFailure } from "@/server/lib/http-error";
import type { AdminActor } from "@/server/plugins/auth";
import { usersAdmin } from "@/services/admin/system";
import { closedTicketStatuses } from "@/services/admin/tickets";

import type { userInputSchema, userPatchSchema } from "./schema";

const requireUser = async (id: string, db: Executor = getDb()) => {
  const [row] = await db.select().from(users).where(eq(users.id, id));
  if (!row) throw notFound("User not found");
  return row;
};

const lockActiveOwners = (db: Executor) =>
  db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "owner"), eq(users.active, true)))
    .for("no key update");

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
  const demoting = patch.role !== undefined && patch.role !== "owner";
  const deactivating = patch.active === false;
  if (id === actor.id && (demoting || deactivating)) {
    throw new ValidationFailure({
      [deactivating ? "active" : "role"]: "You cannot demote or deactivate yourself",
    });
  }
  await getDb().transaction(async (tx) => {
    const owners = demoting || deactivating ? await lockActiveOwners(tx) : [];
    const before = await requireUser(id, tx);
    if (
      before.role === "owner" &&
      (demoting || deactivating) &&
      owners.every((owner) => owner.id === id)
    ) {
      throw new ValidationFailure({ role: "At least one active owner is required" });
    }
    await tx.update(users).set(patch).where(eq(users.id, id));
    const after = { role: patch.role ?? before.role, active: patch.active ?? before.active };
    if (!after.active || !hasPermission(after.role, "tickets:write")) {
      await tx
        .update(tickets)
        .set({ assigneeId: null })
        .where(and(eq(tickets.assigneeId, id), notInArray(tickets.status, closedTicketStatuses)));
    }
  });
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
    .set({
      passwordHash: await hashPassword(temporaryPassword),
      mustChangePassword: true,
      totpEnabled: false,
      totpSecret: null,
    })
    .where(eq(users.id, id));
  await revokeUserSessions(id);
  return { id, temporaryPassword };
};
