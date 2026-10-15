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

const subkey = (purpose: string) =>
  createHmac("sha256", getEnv().SESSION_SECRET).update(`mandegar:${purpose}`).digest();

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

export const openSecret = (sealed: string) => {
  const [iv, tag, encrypted] = sealed.split(".").map((part) => Buffer.from(part, "base64url"));
  if (!iv || !tag || !encrypted) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", subkey("seal"), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
};
