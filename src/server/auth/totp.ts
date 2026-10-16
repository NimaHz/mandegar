import "server-only";

import { eq } from "drizzle-orm";
import { generateSecret, generateURI, verify } from "otplib";

import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { openSecret, sealSecret } from "@/server/lib/crypto";
import { claimOnce } from "@/server/lib/rate-limit";

const ISSUER = "Mandegar";

export const createTotpSecret = (email: string) => {
  const secret = generateSecret();
  return {
    secret,
    sealed: sealSecret(secret),
    uri: generateURI({ issuer: ISSUER, label: email, secret }),
  };
};

export const verifyTotp = async (userId: string, sealed: string | null, code: string) => {
  const opened = sealed ? openSecret(sealed) : null;
  const token = code.replace(/\s/g, "");
  if (!opened || !/^\d{6}$/.test(token)) return false;
  const result = await verify({ secret: opened.plaintext, token, epochTolerance: 30 }).catch(
    () => null,
  );
  if (!result?.valid) return false;
  const step = "timeStep" in result ? result.timeStep : Math.floor(Date.now() / 30_000);
  if (!(await claimOnce(`totp:${userId}:${step}`, 180))) return false;
  if (opened.stale) {
    await getDb()
      .update(users)
      .set({ totpSecret: sealSecret(opened.plaintext) })
      .where(eq(users.id, userId));
  }
  return true;
};
