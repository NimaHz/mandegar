"use client";

import { Download, Plus, Printer, QrCode, ShieldEllipsis } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useState } from "react";

import { CopyButton } from "@/components/shared/copy-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import { formatDate } from "@/lib/dates";
import { adminRoutes } from "@/lib/routes";
import type { AdminOption, AdminWarrantyCode } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { warrantyStatusTone } from "../../config";
import { adminContent } from "../../content";
import { faNumber, faYear } from "../../lib/format";
import { enumOptions, toOptions } from "../../lib/options";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { IconAction, IconLink } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { CodeText } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";
import { GenerateCodeSheet } from "./generate-code-sheet";
import { StatusSheet } from "./status-sheet";

const copy = adminContent.warranty;
const { statuses, common } = adminContent;

interface CodesListProps {
  result: Paginated<AdminWarrantyCode>;
  products: AdminOption[];
  policies: AdminOption[];
  years: number[];
  filtered: boolean;
  canWrite: boolean;
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="size-4.5 cursor-pointer rounded accent-primary"
    />
  );
}

export function CodesList({
  result,
  products,
  policies,
  years,
  filtered,
  canWrite,
}: CodesListProps) {
  const params = useSearchParams();
  const [generate, setGenerate] = useQueryState("generate", parseAsBoolean.withDefault(false));
  const [selected, setSelected] = useState<string[]>([]);
  const [statusCode, setStatusCode] = useState<AdminWarrantyCode | null>(null);
  const pageIds = result.items.map((item) => item.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const exportQuery = new URLSearchParams(params);
  exportQuery.delete("page");
  exportQuery.delete("generate");
  const exportHref = `/api/admin/warranty-codes/export${exportQuery.size ? `?${exportQuery}` : ""}`;

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const toggleAll = () =>
    setSelected((current) =>
      allSelected
        ? current.filter((id) => !pageIds.includes(id))
        : [...new Set([...current, ...pageIds])],
    );

  const columns: Column<AdminWarrantyCode>[] = [
    {
      key: "code",
      header: copy.columns.code,
      mobile: "primary",
      cell: (code) => (
        <span className="flex items-center gap-2">
          <CodeText className="text-[0.9375rem] font-bold tracking-wider text-ink">
            {code.formatted}
          </CodeText>
          <CopyButton value={code.formatted} label={copy.copyCode} className="size-7" />
        </span>
      ),
    },
    {
      key: "product",
      header: copy.columns.product,
      cell: (code) => (
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-bold text-ink">{code.product.name.fa}</span>
          <CodeText className="text-caption text-muted">{code.product.modelCode}</CodeText>
        </span>
      ),
    },
    { key: "year", header: copy.columns.year, cell: (code) => faYear(code.productionYear) },
    {
      key: "status",
      header: common.status,
      cell: (code) => (
        <StatusBadge
          tone={warrantyStatusTone[code.status]}
          label={statuses.warranty[code.status]}
        />
      ),
    },
    {
      key: "policy",
      header: copy.columns.policy,
      mobile: "hidden",
      cell: (code) => code.policy.name,
    },
    {
      key: "issued",
      header: copy.columns.issued,
      className: "whitespace-nowrap",
      cell: (code) => formatDate("fa", code.issuedAt),
    },
  ];

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.warranty}
          title={copy.title}
          description={copy.description}
          action={
            <>
              <a
                href={exportHref}
                className={buttonVariants({ variant: "line", size: "sm" })}
                download
              >
                <Download className="size-4" aria-hidden />
                {copy.export}
              </a>
              {canWrite && (
                <Button onClick={() => void setGenerate(true)}>
                  <Plus className="size-4" aria-hidden />
                  {copy.generate}
                </Button>
              )}
            </>
          }
        />
      }
      toolbar={
        <ListToolbar
          searchPlaceholder={copy.search}
          filters={[
            { key: "productId", label: copy.filters.product, options: toOptions(products, true) },
            {
              key: "productionYear",
              label: copy.filters.year,
              options: years.map((year) => ({ value: String(year), label: faYear(year) })),
            },
            { key: "status", label: copy.filters.status, options: enumOptions(statuses.warranty) },
          ]}
        />
      }
    >
      {selected.length > 0 && (
        <div
          role="status"
          className="sticky top-[4.75rem] z-20 flex items-center gap-3 rounded-field border border-primary/30 bg-primary-soft px-4 py-2.5 shadow-card"
        >
          <span className="flex-1 text-label font-bold text-ink">
            {fill(copy.selectedCount, { count: faNumber(selected.length) })}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            {copy.clearSelection}
          </Button>
          <Link
            href={adminRoutes.labels(selected)}
            target="_blank"
            className={buttonVariants({ size: "sm" })}
          >
            <Printer className="size-4" aria-hidden />
            {fill(copy.printSelected, { count: faNumber(selected.length) })}
          </Link>
        </div>
      )}
      {result.items.length === 0 ? (
        <ListEmpty
          filtered={filtered}
          icon={QrCode}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
          action={
            canWrite && (
              <Button size="sm" onClick={() => void setGenerate(true)}>
                <Plus className="size-4" aria-hidden />
                {copy.generate}
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="flex items-center gap-2.5 px-1 md:hidden">
            <Checkbox checked={allSelected} onChange={toggleAll} label={copy.selectAll} />
            <span className="text-xs font-bold text-muted">{copy.selectAll}</span>
          </div>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(code) => code.id}
            rowClassName={(code) => (selected.includes(code.id) ? "bg-primary-soft/40" : undefined)}
            leading={(code) => (
              <Checkbox
                checked={selected.includes(code.id)}
                onChange={() => toggle(code.id)}
                label={fill(copy.selectCode, { code: code.formatted })}
              />
            )}
            leadingHeader={
              <Checkbox checked={allSelected} onChange={toggleAll} label={copy.selectAll} />
            }
            actions={(code) => (
              <>
                <IconLink
                  href={adminRoutes.labels([code.id])}
                  label={fill(copy.printLabel, { code: code.formatted })}
                  icon={Printer}
                  external
                />
                {canWrite && (
                  <IconAction
                    label={fill(copy.changeStatus, { code: code.formatted })}
                    icon={ShieldEllipsis}
                    onClick={() => setStatusCode(code)}
                  />
                )}
              </>
            )}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
      <GenerateCodeSheet
        open={generate}
        onClose={() => void setGenerate(null)}
        products={products}
        policies={policies}
      />
      <StatusSheet
        key={statusCode?.id ?? "none"}
        code={statusCode}
        onClose={() => setStatusCode(null)}
      />
    </ListFrame>
  );
}
