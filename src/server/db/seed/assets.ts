import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import sharp from "sharp";

import { getEnv } from "@/config/env";
import { ingestMedia } from "@/server/modules/media/service";
import type { LocalizedText } from "@/types/common";

const DOWNLOAD_TIMEOUT_MS = 30_000;

const cacheDir = () => join(resolve(getEnv().UPLOAD_DIR), ".seed-cache");

const sources = (photoId: string) => [
  `https://images.unsplash.com/photo-${photoId}?w=1600&q=80&fm=jpg&fit=max`,
  `https://picsum.photos/seed/${photoId}/1600/1200.jpg`,
];

const download = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return new Uint8Array(await response.arrayBuffer());
};

const cachedPhoto = async (photoId: string) => {
  const file = join(cacheDir(), `${photoId}.jpg`);
  const cached = await readFile(file).catch(() => null);
  if (cached) return new Uint8Array(cached);
  for (const url of sources(photoId)) {
    const data = await download(url).catch(() => null);
    if (data) {
      await mkdir(cacheDir(), { recursive: true });
      await writeFile(file, data);
      return data;
    }
  }
  return null;
};

const placeholderPhoto = async (photoId: string) => {
  const hue = 170 + ([...photoId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue}, 28%, 86%)"/><stop offset="1" stop-color="hsl(${hue + 10}, 34%, 58%)"/></linearGradient></defs><rect width="1600" height="1200" fill="url(#g)"/><circle cx="800" cy="600" r="220" fill="hsl(38, 80%, 62%)" fill-opacity="0.35"/></svg>`;
  return new Uint8Array(await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer());
};

const photoMedia = async (photoId: string, alt: LocalizedText) => {
  const downloaded = await cachedPhoto(photoId);
  if (!downloaded) process.stdout.write(`  ! photo ${photoId} unavailable, using a placeholder\n`);
  const data = downloaded ?? (await placeholderPhoto(photoId));
  return ingestMedia(data, { kinds: ["image"], alt, originalName: `${photoId}.jpg` });
};

export const photoLibrary = async (photos: Record<string, LocalizedText>) => {
  const entries = Object.entries(photos);
  const results = new Map<string, string>();
  for (let index = 0; index < entries.length; index += 6) {
    const batch = entries.slice(index, index + 6);
    const rows = await Promise.all(batch.map(([photoId, alt]) => photoMedia(photoId, alt)));
    rows.forEach((row, offset) => {
      const photoId = batch[offset]?.[0];
      if (row && photoId) results.set(photoId, row.id);
    });
  }
  return results;
};

export const logoMedia = async (svg: string, alt: LocalizedText, name: string) => {
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return ingestMedia(new Uint8Array(png), { kinds: ["image"], alt, originalName: `${name}.png` });
};

const pdfText = (value: string) => value.replace(/[\\()]/g, (symbol) => `\\${symbol}`);

const buildPdf = (lines: readonly string[]) => {
  const content = [
    "BT",
    "/F1 22 Tf",
    "72 760 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -32 Td /F1 13 Tf",
      `(${pdfText(line)}) Tj`,
    ]),
    "ET",
  ]
    .filter(Boolean)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets = objects.map((object, index) => {
    const offset = body.length;
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(body);
};

export const documentMedia = async (lines: readonly string[], alt: LocalizedText, name: string) =>
  ingestMedia(buildPdf(lines), { kinds: ["document"], alt, originalName: `${name}.pdf` });
