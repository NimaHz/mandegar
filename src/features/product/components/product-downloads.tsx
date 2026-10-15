import {
  BookOpen,
  Download,
  FileSpreadsheet,
  FileText,
  type LucideIcon,
  ShieldCheck,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";
import type { DownloadKind, ProductDownload } from "@/types/catalog";

import { productContent } from "../content";

interface ProductDownloadsProps {
  downloads: ProductDownload[];
  locale: Locale;
}

const kindIcons: Record<DownloadKind, LucideIcon> = {
  manual: BookOpen,
  catalog: FileText,
  "warranty-card": ShieldCheck,
  datasheet: FileSpreadsheet,
};

const extensionOf = (mime: string, href: string) =>
  (mime.split("/")[1] ?? href.split(".").pop() ?? "").replace(/^x-/, "").toUpperCase();

export function ProductDownloads({ downloads, locale }: ProductDownloadsProps) {
  const { downloads: content } = productContent[locale];

  const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024
      ? `${formatNumber(locale, bytes / (1024 * 1024), { maximumFractionDigits: 1 })} ${content.units.mb}`
      : `${formatNumber(locale, Math.max(1, Math.round(bytes / 1024)))} ${content.units.kb}`;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {downloads.map((download) => {
        const Icon = kindIcons[download.kind];
        return (
          <li key={download.file.href}>
            <a
              href={download.file.href}
              download
              className="group flex h-full card-interactive items-center gap-4 card p-4 shadow-card"
            >
              <span className="icon-tile size-12 rounded-field">
                <Icon className="size-5.5" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-extrabold text-ink">{download.title}</span>
                <span className="text-xs text-muted">
                  {download.title !== content.kinds[download.kind] &&
                    `${content.kinds[download.kind]} · `}
                  <bdi dir="ltr" className="font-code">
                    {extensionOf(download.file.mime, download.file.href)}
                  </bdi>{" "}
                  · {formatSize(download.file.size)}
                </span>
              </span>
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-chip text-ink transition-colors group-hover:bg-primary group-hover:text-on-primary"
              >
                <Download className="size-4.5" />
              </span>
              <span className="sr-only">{content.download}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
