import "server-only";

import { type Challenge, createChallenge, randomInt, verifySolution } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";

import { z } from "@/lib/zod";
import { getServerEnv } from "@/server/env";
import { derivedSecret } from "@/server/lib/crypto";
import { claimOnce } from "@/server/lib/rate-limit";

const ALGORITHM = "PBKDF2/SHA-256";
const EXPIRES_MS = 10 * 60 * 1000;
const COUNTER_MIN = 300;
const COUNTER_MAX = 1_500;
const REPLAY_WINDOW_SEC = 60 * 60;
const MAX_PAYLOAD_LENGTH = 8_000;

const secrets = () => ({
  hmacSignatureSecret: derivedSecret("altcha-signature"),
  hmacKeySignatureSecret: derivedSecret("altcha-key-signature"),
});

const payloadSchema = z.object({
  challenge: z.looseObject({
    parameters: z.looseObject({
      algorithm: z.literal(ALGORITHM),
      nonce: z.string().max(200),
      salt: z.string().max(200),
      cost: z.number().int().positive(),
      keyLength: z.number().int().positive(),
      keyPrefix: z.string().max(200),
    }),
    signature: z.string().min(16).max(200),
  }),
  solution: z.object({
    counter: z.number().int().min(0),
    derivedKey: z.string().max(400),
    time: z.number().optional(),
  }),
});

export const issueChallenge = (): Promise<Challenge> =>
  createChallenge({
    algorithm: ALGORITHM,
    cost: getServerEnv().ALTCHA_COST,
    counter: randomInt(COUNTER_MAX, COUNTER_MIN),
    deriveKey,
    expiresAt: new Date(Date.now() + EXPIRES_MS),
    ...secrets(),
  });

const decodePayload = (payload: string) => {
  if (payload.length === 0 || payload.length > MAX_PAYLOAD_LENGTH) return null;
  try {
    const parsed = payloadSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64").toString("utf8")),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const verifyAltcha = async (payload: string | undefined) => {
  const decoded = payload ? decodePayload(payload) : null;
  if (!decoded) return false;
  const result = await verifySolution({
    challenge: decoded.challenge,
    solution: decoded.solution,
    deriveKey,
    ...secrets(),
  }).catch(() => null);
  if (!result?.verified) return false;
  return claimOnce(`altcha:${decoded.challenge.signature}`, REPLAY_WINDOW_SEC);
};
