"use client";

import { ExternalLink, PenLine, Plus, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { AdminBrand } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { useSheetTarget } from "../../lib/use-sheet-target";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { PublishToggle } from "../data/publish-toggle";
import { DeleteAction, IconAction } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { CodeText, ThumbCell } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";
import { BrandSheet } from "./brand-sheet";

const copy = adminContent.brands;
const { common } = adminContent;

interface BrandsListProps {
  result: Paginated<AdminBrand>;
  filtered: boolean;
  canWrite: boolean;
}

export function BrandsList({ result, filtered, canWrite }: BrandsListProps) {
  const { run } = useAdminMutation();
  const sheet = useSheetTarget<AdminBrand>();
  const editing = sheet.target?.mode === "edit" ? sheet.target.item : null;

  const columns: Column<AdminBrand>[] = [
    {
      key: "brand",
      header: copy.columns.brand,
      mobile: "primary",
      cell: (brand) => (
        <button type="button" onClick={() => sheet.openEdit(brand)} className="text-start">
          <ThumbCell
            media={brand.logo}
            title={brand.name.fa}
            subtitle={<CodeText>{brand.slug}</CodeText>}
            fit="contain"
          />
        </button>
      ),
    },
    {
      key: "type",
      header: copy.columns.type,
      cell: (brand) => (
        <StatusBadge
          tone={brand.isOwn ? "primary" : "chip"}
          label={brand.isOwn ? copy.own : copy.partner}
          dot={false}
        />
      ),
    },
    {
      key: "website",
      header: copy.columns.website,
      cell: (brand) =>
        brand.website ? (
          <a
            href={brand.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <bdi dir="ltr" className="max-w-40 truncate">
              {brand.website.replace(/^https?:\/\//, "")}
            </bdi>
            <ExternalLink className="size-3.5 shrink-0" aria-hidden />
          </a>
        ) : (
          <span className="text-subtle">—</span>
        ),
    },
    {
      key: "products",
      header: copy.columns.products,
      cell: (brand) => faNumber(brand.productCount),
    },
    {
      key: "status",
      header: common.status,
      cell: (brand) => (
        <StatusBadge
          tone={brand.published ? "success" : "chip"}
          label={brand.published ? common.published : common.hidden}
        />
      ),
    },
  ];

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.catalog}
          title={copy.title}
          description={copy.description}
          action={
            canWrite && (
              <Button onClick={sheet.openCreate}>
                <Plus className="size-4" aria-hidden />
                {copy.create}
              </Button>
            )
          }
        />
      }
      toolbar={<ListToolbar searchPlaceholder={copy.search} />}
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={Tags} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(brand) => brand.id}
            actions={(brand) => (
              <>
                {canWrite && (
                  <PublishToggle
                    published={brand.published}
                    label={brand.name.fa}
                    onToggle={() =>
                      void run(
                        () =>
                          apiClient.api.admin
                            .brands({ id: brand.id })
                            .patch({ published: !brand.published }),
                        {
                          success: copy.saved,
                        },
                      )
                    }
                  />
                )}
                <IconAction
                  label={`${common.edit} ${brand.name.fa}`}
                  icon={PenLine}
                  onClick={() => sheet.openEdit(brand)}
                />
                {canWrite && (
                  <DeleteAction
                    label={brand.name.fa}
                    onConfirm={() =>
                      void run(() => apiClient.api.admin.brands({ id: brand.id }).delete(), {
                        success: common.deleted,
                      })
                    }
                  />
                )}
              </>
            )}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
      {sheet.target && (
        <BrandSheet
          key={editing?.id ?? "new"}
          brand={editing}
          onClose={sheet.close}
          readOnly={!canWrite}
        />
      )}
    </ListFrame>
  );
}
