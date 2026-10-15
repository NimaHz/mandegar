import "server-only";

import { eq } from "drizzle-orm";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

import { getDb } from "@/server/db/client";
import { media } from "@/server/db/schema";
import { sha256 } from "@/server/lib/crypto";
import { payloadTooLarge, unsupportedMedia } from "@/server/lib/http-error";
import { ulid } from "@/server/lib/ids";
import { getStorage } from "@/server/storage";
import type { MediaKind } from "@/types/admin";
import type { LocalizedText } from "@/types/common";

const MB = 1024 * 1024;

export const mediaSizeLimits: Record<MediaKind, number> = {
  image: 15 * MB,
  video: 200 * MB,
  document: 30 * MB,
};

const acceptedTypes: Record<string, { kind: MediaKind; ext: string }> = {
  "image/jpeg": { kind: "image", ext: "webp" },
  "image/png": { kind: "image", ext: "webp" },
  "image/webp": { kind: "image", ext: "webp" },
  "image/avif": { kind: "image", ext: "webp" },
  "video/mp4": { kind: "video", ext: "mp4" },
  "video/webm": { kind: "video", ext: "webm" },
  "application/pdf": { kind: "document", ext: "pdf" },
};

const MAX_DIMENSION = 2400;

export interface IngestOptions {
  kinds: readonly MediaKind[];
  limits?: Partial<Record<MediaKind, number>>;
  allowedMimes?: readonly string[];
  alt?: LocalizedText;
  uploadedBy?: string | null;
  originalName?: string | null;
}

interface PreparedFile {
  bytes: Uint8Array;
  mime: string;
  ext: string;
  width: number | null;
  height: number | null;
}

const encodeImage = async (input: Uint8Array): Promise<PreparedFile> => {
  const { data, info } = await sharp(input, { limitInputPixels: 80_000_000 })
    .autoOrient()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return { bytes: data, mime: "image/webp", ext: "webp", width: info.width, height: info.height };
};

const storageKeyFor = (ext: string, now = new Date()) =>
  `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${ulid()}.${ext}`;

const findBySha = async (hash: string) => {
  const [row] = await getDb().select().from(media).where(eq(media.sha256, hash)).limit(1);
  return row ?? null;
};

const detect = async (data: Uint8Array, options: IngestOptions) => {
  const detected = await fileTypeFromBuffer(data);
  const accepted = detected ? acceptedTypes[detected.mime] : undefined;
  if (!detected || !accepted || !options.kinds.includes(accepted.kind)) {
    throw unsupportedMedia("File type is not allowed");
  }
  if (options.allowedMimes && !options.allowedMimes.includes(detected.mime)) {
    throw unsupportedMedia("File type is not allowed");
  }
  const limit = options.limits?.[accepted.kind] ?? mediaSizeLimits[accepted.kind];
  if (data.byteLength > limit) throw payloadTooLarge(`File exceeds ${Math.round(limit / MB)} MB`);
  return { mime: detected.mime, ...accepted };
};

const prepare = async (
  data: Uint8Array,
  type: { mime: string; kind: MediaKind; ext: string },
): Promise<PreparedFile> => {
  if (type.kind === "image") {
    return encodeImage(data).catch(() => {
      throw unsupportedMedia("Image could not be decoded");
    });
  }
  return { bytes: data, mime: type.mime, ext: type.ext, width: null, height: null };
};

export const ingestMedia = async (data: Uint8Array, options: IngestOptions) => {
  const type = await detect(data, options);
  const hash = sha256(data);
  const existing = await findBySha(hash);
  if (existing) return existing;
  const prepared = await prepare(data, type);
  const storageKey = storageKeyFor(prepared.ext);
  const storage = await getStorage();
  await storage.put(storageKey, prepared.bytes, prepared.mime);
  const [row] = await getDb()
    .insert(media)
    .values({
      kind: type.kind,
      storageKey,
      mime: prepared.mime,
      size: prepared.bytes.byteLength,
      width: prepared.width,
      height: prepared.height,
      sha256: hash,
      alt: options.alt ?? { fa: "", en: "" },
      originalName: options.originalName?.slice(0, 200) ?? null,
      uploadedBy: options.uploadedBy ?? null,
    })
    .onConflictDoNothing({ target: media.sha256 })
    .returning();
  if (row) return row;
  await storage.remove(storageKey);
  const raced = await findBySha(hash);
  if (!raced) throw new Error("Media insert failed");
  return raced;
};

export const ingestFile = async (file: File, options: IngestOptions) =>
  ingestMedia(new Uint8Array(await file.arrayBuffer()), {
    originalName: file.name,
    ...options,
  });
