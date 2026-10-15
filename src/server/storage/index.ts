import "server-only";

import { getServerEnv } from "@/server/env";

export interface ByteRange {
  start: number;
  end: number;
}

export interface StoredObject {
  body: ReadableStream<Uint8Array>;
  size: number;
  range: ByteRange | null;
}

export interface StorageDriver {
  put: (key: string, data: Uint8Array, mime: string) => Promise<void>;
  get: (key: string, range: ByteRange | null) => Promise<StoredObject | null>;
  remove: (key: string) => Promise<void>;
}

const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_-]*(\.[A-Za-z0-9]+)?$/;

export const isSafeStorageKey = (key: string) => {
  const segments = key.split("/");
  return (
    key.length <= 200 &&
    segments.length <= 4 &&
    segments.every((segment) => SAFE_SEGMENT.test(segment))
  );
};

const PRIVATE_ROOT = "private";

export const privateStorageKey = (key: string) => `${PRIVATE_ROOT}/${key}`;

export const isPublicStorageKey = (key: string) =>
  isSafeStorageKey(key) && key.split("/")[0] !== PRIVATE_ROOT;

let driver: Promise<StorageDriver> | undefined;

const createDriver = async (): Promise<StorageDriver> => {
  const env = getServerEnv();
  if (env.STORAGE_DRIVER === "s3") {
    const { createS3Driver } = await import("./s3");
    return createS3Driver(env);
  }
  const { createLocalDriver } = await import("./local");
  return createLocalDriver(env.UPLOAD_DIR);
};

export const getStorage = () => {
  driver ??= createDriver();
  return driver;
};
