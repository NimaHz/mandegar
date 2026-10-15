"use client";

import { ArrowRight, Printer, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/ui/qr-code";
import { Select } from "@/components/ui/select";
import { siteConfig } from "@/config/site";
import { fill } from "@/i18n/fill";
import { adminRoutes } from "@/lib/routes";
import type { AdminWarrantyCode } from "@/types/admin";

import { adminContent } from "../../content";
import { faNumber, faYear } from "../../lib/format";
import { warrantyQrValue } from "../../lib/warranty";

const copy = adminContent.warranty.labels;
const PER_SHEET = 24;
const copyOptions = [1, 2, 3, 4, 6, 8, 12, 24];

const chunk = <TItem,>(items: TItem[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );

function Label({ code }: { code: AdminWarrantyCode }) {
  return (
    <div className="flex h-[37mm] w-[70mm] items-center gap-[2.5mm] overflow-hidden px-[3mm] py-[2.5mm]">
      <QrCode
        value={warrantyQrValue(code.code)}
        label={code.formatted}
        className="size-[28mm] shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[1mm] leading-tight">
        <span className="flex items-center gap-[1mm]">
          <LogoMark className="size-[4mm]" />
          <span className="font-display text-[8pt] font-black text-ink">{siteConfig.name.fa}</span>
          <span className="ms-auto text-[5.5pt] font-bold text-muted">{copy.scan}</span>
        </span>
        <span className="line-clamp-2 text-[6.5pt] font-bold text-ink">{code.product.name.fa}</span>
        <bdi dir="ltr" className="text-start font-code text-[6pt] text-body">
          {code.product.modelCode}
        </bdi>
        <bdi
          dir="ltr"
          className="text-start font-code text-[10.5pt] font-bold tracking-[0.06em] text-ink"
        >
          {code.formatted}
        </bdi>
        <span className="text-[6pt] font-bold text-body">
          {fill(copy.year, { year: faYear(code.productionYear) })}
        </span>
      </div>
    </div>
  );
}

export function LabelSheet({ codes }: { codes: AdminWarrantyCode[] }) {
  const [copies, setCopies] = useState(codes.length === 1 ? PER_SHEET : 1);
  const labels = codes.flatMap((code) => Array.from({ length: copies }, () => code));
  const sheets = chunk(labels, PER_SHEET);

  return (
    <div data-theme="light" className="min-h-dvh bg-canvas text-ink print:bg-white">
      <style>{"@page { size: A4; margin: 0; }"}</style>
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href={adminRoutes.warranty}
            className="inline-flex h-10 items-center gap-1.5 rounded-control px-3 text-label font-bold text-ink-soft transition-colors hover:bg-sunken"
          >
            <ArrowRight className="size-4" aria-hidden />
            {copy.back}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="text-base font-extrabold text-ink">{copy.title}</h1>
            <p className="text-caption text-muted" role="status">
              {fill(copy.count, {
                labels: faNumber(labels.length),
                sheets: faNumber(sheets.length),
              })}
            </p>
          </div>
          <label className="flex items-center gap-2 text-label font-bold text-ink">
            {copy.copies}
            <Select
              options={copyOptions.map((value) => ({
                value: String(value),
                label: value === PER_SHEET ? `${faNumber(value)} · ${copy.fill}` : faNumber(value),
              }))}
              value={String(copies)}
              onChange={(event) => setCopies(Number(event.target.value))}
              className="h-10 w-40"
            />
          </label>
          <Button onClick={() => window.print()} disabled={labels.length === 0}>
            <Printer className="size-4" aria-hidden />
            {copy.print}
          </Button>
        </div>
        <p className="mx-auto max-w-5xl px-4 pb-3 text-caption text-muted sm:px-6">
          {copy.description}
        </p>
      </header>
      {labels.length === 0 ? (
        <p className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
          <TriangleAlert className="size-4" aria-hidden />
          {copy.empty}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-8 overflow-x-auto px-4 py-8 print:block print:p-0">
          {sheets.map((sheet, index) => (
            <section
              key={index}
              aria-label={`${copy.title} ${faNumber(index + 1)}`}
              className="grid h-[297mm] w-[210mm] shrink-0 grid-cols-3 content-start bg-white shadow-lift print:break-after-page print:shadow-none"
            >
              {sheet.map((code, cell) => (
                <div
                  key={`${code.id}-${cell}`}
                  className="outline outline-line outline-dashed print:outline-none"
                >
                  <Label code={code} />
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
