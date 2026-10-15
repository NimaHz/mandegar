import "server-only";

import { hash, verify } from "@node-rs/argon2";

const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

let decoyHash: Promise<string> | undefined;

export const hashPassword = (password: string) => hash(password);

export const verifyPassword = async (passwordHash: string, password: string) => {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
};

export const burnPasswordCheck = async (password: string) => {
  decoyHash ??= hash(crypto.randomUUID());
  await verifyPassword(await decoyHash, password);
  return false;
};

export const generateTemporaryPassword = (length = 16) =>
  [...crypto.getRandomValues(new Uint8Array(length))]
    .map((byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length] ?? "x")
    .join("");
