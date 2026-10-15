import type { AdminMedia, MediaKind } from "@/types/admin";

import { type AdminApiError, toApiError } from "./api-error";

export interface UploadOptions {
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export type UploadResult = { ok: true; media: AdminMedia } | { ok: false; error: AdminApiError };

const parseBody = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const uploadMedia = (file: File, { onProgress, signal }: UploadOptions = {}) =>
  new Promise<UploadResult>((resolve) => {
    const request = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);
    request.open("POST", "/api/admin/media");
    request.withCredentials = true;
    request.responseType = "text";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    request.onload = () => {
      const value = parseBody(request.responseText);
      if (request.status >= 200 && request.status < 300 && value) {
        resolve({ ok: true, media: value as AdminMedia });
        return;
      }
      resolve({
        ok: false,
        error: toApiError(
          { status: request.status, value },
          request.getResponseHeader("retry-after"),
        ),
      });
    };
    request.onerror = () => resolve({ ok: false, error: toApiError(null) });
    request.onabort = () => resolve({ ok: false, error: toApiError(null) });
    signal?.addEventListener("abort", () => request.abort());
    request.send(body);
  });

const acceptByKind: Record<MediaKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif,image/gif",
  video: "video/mp4,video/webm",
  document: "application/pdf",
};

export const acceptFor = (kinds: readonly MediaKind[]) =>
  kinds.map((kind) => acceptByKind[kind]).join(",");
