import "server-only";

import { generateSecret, generateURI, verify } from "otplib";

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
  const secret = sealed ? openSecret(sealed) : null;
  const token = code.replace(/\s/g, "");
  if (!secret || !/^\d{6}$/.test(token)) return false;
  const result = await verify({ secret, token, epochTolerance: 30 }).catch(() => null);
  if (!result?.valid) return false;
  const step = "timeStep" in result ? result.timeStep : Math.floor(Date.now() / 30_000);
  return claimOnce(`totp:${userId}:${step}`, 180);
};
