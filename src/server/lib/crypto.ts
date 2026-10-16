import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { getEnv } from "@/config/env";

const keyFrom = (secret: string, purpose: string) =>
  createHmac("sha256", secret).update(`mandegar:${purpose}`).digest();

const subkey = (purpose: string) => keyFrom(getEnv().SESSION_SECRET, purpose);

const sealKeys = () => {
  const { SESSION_SECRET, SESSION_SECRET_PREVIOUS } = getEnv();
  return [SESSION_SECRET, SESSION_SECRET_PREVIOUS].flatMap((secret) =>
    secret ? [keyFrom(secret, "seal")] : [],
  );
};

export const sha256 = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");

export const sign = (value: string, purpose: string) =>
  createHmac("sha256", subkey(purpose)).update(value).digest("base64url");

export const derivedSecret = (purpose: string) => subkey(purpose).toString("hex");

export const safeEqual = (left: string, right: string) =>
  timingSafeEqual(
    createHash("sha256").update(left).digest(),
    createHash("sha256").update(right).digest(),
  );

export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export const sealSecret = (plaintext: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", subkey("seal"), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
};

const decrypt = (key: Buffer, iv: Buffer, tag: Buffer, encrypted: Buffer) => {
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
};

export const openSecret = (sealed: string) => {
  const [iv, tag, encrypted] = sealed.split(".").map((part) => Buffer.from(part, "base64url"));
  if (!iv || !tag || !encrypted) return null;
  for (const [index, key] of sealKeys().entries()) {
    const plaintext = decrypt(key, iv, tag, encrypted);
    if (plaintext !== null) return { plaintext, stale: index > 0 };
  }
  return null;
};
