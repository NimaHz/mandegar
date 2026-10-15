import { type ByteRange, getStorage, isPublicStorageKey } from "@/server/storage";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};

const RANGE = /^bytes=(\d+)-(\d*)$/;

const parseRange = (header: string | null): ByteRange | null => {
  const match = header ? RANGE.exec(header.trim()) : null;
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : Number.MAX_SAFE_INTEGER;
  return Number.isSafeInteger(start) && start <= end ? { start, end } : null;
};

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(request: Request, context: RouteContext<"/uploads/[...path]">) {
  const { path } = await context.params;
  const key = path.join("/");
  const extension = key.slice(key.lastIndexOf(".") + 1).toLowerCase();
  const contentType = contentTypes[extension];
  if (!contentType || !isPublicStorageKey(key)) return notFound();
  const requested = parseRange(request.headers.get("range"));
  const storage = await getStorage();
  const file = await storage.get(key, requested);
  if (!file) return notFound();
  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });
  if (extension === "pdf") headers.set("Content-Disposition", "inline");
  if (requested && !file.range) {
    await file.body.cancel();
    headers.set("Content-Range", `bytes */${file.size}`);
    return new Response(null, { status: 416, headers });
  }
  if (file.range) {
    headers.set("Content-Range", `bytes ${file.range.start}-${file.range.end}/${file.size}`);
    headers.set("Content-Length", String(file.range.end - file.range.start + 1));
    return new Response(file.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(file.size));
  return new Response(file.body, { status: 200, headers });
}
