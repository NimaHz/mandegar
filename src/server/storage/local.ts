import "server-only";

import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { Readable } from "node:stream";

import {
  type ByteRange,
  isPublicStorageKey,
  isSafeStorageKey,
  type StorageDriver,
  type StoredObject,
} from "./index";

const resolveKey = (root: string, key: string) => {
  if (!isSafeStorageKey(key)) return null;
  const path = resolve(root, key);
  return path.startsWith(`${root}${sep}`) ? path : null;
};

const toWebStream = (path: string, range: ByteRange | null): ReadableStream<Uint8Array> =>
  Readable.toWeb(
    createReadStream(path, range ? { start: range.start, end: range.end } : {}),
  ) as ReadableStream<Uint8Array>;

export const createLocalDriver = (uploadDir: string): StorageDriver => {
  const root = resolve(uploadDir);
  return {
    put: async (key, data) => {
      const path = resolveKey(root, key);
      if (!path) throw new Error(`Unsafe storage key ${key}`);
      const shared = isPublicStorageKey(key);
      await mkdir(dirname(path), { recursive: true, mode: shared ? 0o755 : 0o700 });
      await writeFile(path, data, { flag: "wx", mode: shared ? 0o644 : 0o600 });
    },
    get: async (key, range): Promise<StoredObject | null> => {
      const path = resolveKey(root, key);
      if (!path) return null;
      const info = await stat(path).catch(() => null);
      if (!info?.isFile()) return null;
      const bounded =
        range && range.start < info.size
          ? { start: range.start, end: Math.min(range.end, info.size - 1) }
          : null;
      return { body: toWebStream(path, bounded), size: info.size, range: bounded };
    },
    remove: async (key) => {
      const path = resolveKey(root, key);
      if (path) await rm(path, { force: true });
    },
  };
};
