import "server-only";

import type { ServerEnv } from "@/server/env";

import type { StorageDriver, StoredObject } from "./index";

const requireValue = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`${name} is required when STORAGE_DRIVER=s3`);
  return value;
};

export const createS3Driver = async (env: ServerEnv): Promise<StorageDriver> => {
  const {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    NoSuchKey,
    PutObjectCommand,
    S3Client,
    S3ServiceException,
  } = await import("@aws-sdk/client-s3");
  const bucket = requireValue(env.S3_BUCKET, "S3_BUCKET");
  const client = new S3Client({
    endpoint: requireValue(env.S3_ENDPOINT, "S3_ENDPOINT"),
    region: env.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: requireValue(env.S3_ACCESS_KEY_ID, "S3_ACCESS_KEY_ID"),
      secretAccessKey: requireValue(env.S3_SECRET_ACCESS_KEY, "S3_SECRET_ACCESS_KEY"),
    },
  });
  const unsatisfiable = async (key: string): Promise<StoredObject> => {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { body: new ReadableStream<Uint8Array>(), size: head.ContentLength ?? 0, range: null };
  };
  return {
    put: async (key, data, mime) => {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: mime }),
      );
    },
    get: async (key, range): Promise<StoredObject | null> => {
      try {
        const result = await client.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
            Range: range ? `bytes=${range.start}-${range.end}` : undefined,
          }),
        );
        if (!result.Body) return null;
        const total = Number(result.ContentRange?.split("/")[1] ?? result.ContentLength ?? 0);
        const length = result.ContentLength ?? total;
        return {
          body: result.Body.transformToWebStream() as ReadableStream<Uint8Array>,
          size: total,
          range: range ? { start: range.start, end: range.start + length - 1 } : null,
        };
      } catch (error) {
        if (error instanceof NoSuchKey) return null;
        if (range && error instanceof S3ServiceException && error.name === "InvalidRange") {
          return unsatisfiable(key);
        }
        throw error;
      }
    },
    remove: async (key) => {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
};
