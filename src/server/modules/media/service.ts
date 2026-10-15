import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

import { MB } from "@/lib/format";
import { getDb } from "@/server/db/client";
import { media } from "@/server/db/schema";
import { sha256 } from "@/server/lib/crypto";
import { guardDelete } from "@/server/lib/db-errors";
import {
  conflict,
  notFound,
  orNotFound,
  payloadTooLarge,
  unsupportedMedia,
  ValidationFailure,
} from "@/server/lib/http-error";
import { ulid } from "@/server/lib/ids";
import { revalidateSite } from "@/server/lib/revalidate";
import { getStorage, privateStorageKey } from "@/server/storage";
import { mediaAdmin } from "@/services/admin/media";
import type { MediaKind, MediaScope } from "@/types/admin";
import type { LocalizedText } from "@/types/common";

const mediaSizeLimits: Record<MediaKind, number> = {
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

interface IngestOptions {
  kinds: readonly MediaKind[];
  limits?: Partial<Record<MediaKind, number>>;
  allowedMimes?: readonly string[];
  alt?: LocalizedText;
  uploadedBy?: string | null;
  originalName?: string | null;
  scope?: MediaScope;
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

const storageKeyFor = (ext: string, scope: MediaScope, now = new Date()) => {
  const key = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${ulid()}.${ext}`;
  return scope === "library" ? key : privateStorageKey(key);
};

const findLibraryCopy = async (hash: string) => {
  const [row] = await getDb()
    .select()
    .from(media)
    .where(and(eq(media.scope, "library"), eq(media.sha256, hash)))
    .limit(1);
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
  const scope = options.scope ?? "library";
  const type = await detect(data, options);
  const hash = sha256(data);
  const shared = scope === "library";
  const existing = shared ? await findLibraryCopy(hash) : null;
  if (existing) return existing;
  const prepared = await prepare(data, type);
  const storageKey = storageKeyFor(prepared.ext, scope);
  const storage = await getStorage();
  await storage.put(storageKey, prepared.bytes, prepared.mime);
  const insert = getDb()
    .insert(media)
    .values({
      kind: type.kind,
      scope,
      storageKey,
      mime: prepared.mime,
      size: prepared.bytes.byteLength,
      width: prepared.width,
      height: prepared.height,
      sha256: hash,
      alt: options.alt ?? { fa: "", en: "" },
      originalName: options.originalName?.slice(0, 200) ?? null,
      uploadedBy: options.uploadedBy ?? null,
    });
  const [row] = await (
    shared
      ? insert.onConflictDoNothing({ target: media.sha256, where: sql`scope = 'library'` })
      : insert
  ).returning();
  if (row) return row;
  await storage.remove(storageKey);
  const raced = await findLibraryCopy(hash);
  if (!raced) throw new Error("Media insert failed");
  return raced;
};

export const ingestFile = async (file: File, options: IngestOptions) =>
  ingestMedia(new Uint8Array(await file.arrayBuffer()), {
    originalName: file.name,
    ...options,
  });

export const assertLibraryMedia = async (fields: Record<string, string | null | undefined>) => {
  const refs = Object.entries(fields).flatMap(([field, id]) => (id ? [{ field, id }] : []));
  if (refs.length === 0) return;
  const rows = await getDb()
    .select({ id: media.id })
    .from(media)
    .where(
      and(
        inArray(
          media.id,
          refs.map((ref) => ref.id),
        ),
        eq(media.scope, "library"),
      ),
    );
  const found = new Set(rows.map((row) => row.id));
  const missing = refs.filter((ref) => !found.has(ref.id));
  if (missing.length > 0) {
    throw new ValidationFailure(
      Object.fromEntries(missing.map((ref) => [ref.field, "Referenced item not found"])),
    );
  }
};

const SVG = /\.svgz?$/i;

export const uploadMedia = async (file: File, alt: LocalizedText, uploadedBy: string) => {
  if (file.type === "image/svg+xml" || SVG.test(file.name))
    throw unsupportedMedia("SVG files are not allowed");
  const row = await ingestFile(file, { kinds: ["image", "video", "document"], alt, uploadedBy });
  return orNotFound(await mediaAdmin.get(row.id));
};

export const updateMediaAlt = async (id: string, alt: LocalizedText) => {
  const [row] = await getDb()
    .update(media)
    .set({ alt })
    .where(eq(media.id, id))
    .returning({ id: media.id });
  if (!row) throw notFound("Media not found");
  revalidateSite();
  return orNotFound(await mediaAdmin.get(id));
};

export const deleteMedia = async (id: string) => {
  const target = orNotFound(await mediaAdmin.get(id), "Media not found");
  const usages = await mediaAdmin.usages(id, { ticketLabels: false });
  if (usages.length > 0) {
    throw conflict(`Media is used by ${usages.map((entry) => entry.entity).join(", ")}`, "IN_USE");
  }
  await guardDelete(() => getDb().delete(media).where(eq(media.id, id)));
  await (await getStorage()).remove(target.storageKey);
  return { id };
};
