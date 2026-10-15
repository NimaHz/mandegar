"use client";

import { Boxes, ExternalLink, Eye, EyeOff, Plus, Sparkles, Star } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { localizePath } from "@/i18n/paths";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/dates";
import { adminRoutes, routes } from "@/lib/routes";
import type { AdminOption, AdminProductListItem } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { contentStatusTone } from "../../config";
import { adminContent } from "../../content";
import { enumOptions, toOptions } from "../../lib/options";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { DeleteAction, IconAction, IconLink } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { CodeText, ThumbCell } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.products;
const { statuses, common } = adminContent;

interface ProductsListProps {
  result: Paginated<AdminProductListItem>;
  categories: AdminOption[];
  brands: AdminOption[];
  filtered: boolean;
  canWrite: boolean;
}

export function ProductsList({
  result,
  categories,
  brands,
  filtered,
  canWrite,
}: ProductsListProps) {
  const { run } = useAdminMutation();

  const togglePublish = (product: AdminProductListItem) => {
    const status = product.status === "published" ? "draft" : "published";
    void run(() => apiClient.api.admin.products({ id: product.id }).patch({ status }), {
      success: status === "published" ? copy.publishedToast : copy.unpublishedToast,
    });
  };

  const remove = (product: AdminProductListItem) =>
    void run(() => apiClient.api.admin.products({ id: product.id }).delete(), {
      success: common.deleted,
    });

  const columns: Column<AdminProductListItem>[] = [
    {
      key: "product",
      header: copy.columns.product,
      mobile: "primary",
      cell: (product) => (
        <ThumbCell
          media={product.image}
          title={product.name.fa}
          href={adminRoutes.product(product.id) as Route}
          subtitle={<CodeText>{product.modelCode}</CodeText>}
        />
      ),
    },
    { key: "category", header: copy.columns.category, cell: (product) => product.category.name.fa },
    { key: "brand", header: copy.columns.brand, cell: (product) => product.brand.name.fa },
    {
      key: "status",
      header: common.status,
      cell: (product) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusBadge
            tone={contentStatusTone[product.status]}
            label={statuses.content[product.status]}
          />
          {product.featured && (
            <Star className="size-4 fill-accent text-accent" aria-label={copy.featured} />
          )}
          {product.isNew && <Sparkles className="size-4 text-primary" aria-label={copy.isNew} />}
        </span>
      ),
    },
    {
      key: "updated",
      header: common.updatedAt,
      className: "whitespace-nowrap",
      cell: (product) => formatDate("fa", product.updatedAt),
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
              <Link href={adminRoutes.newProduct} className={buttonVariants()}>
                <Plus className="size-4" aria-hidden />
                {copy.create}
              </Link>
            )
          }
        />
      }
      toolbar={
        <ListToolbar
          searchPlaceholder={copy.search}
          filters={[
            { key: "status", label: common.status, options: enumOptions(statuses.content) },
            { key: "categoryId", label: copy.columns.category, options: toOptions(categories) },
            { key: "brandId", label: copy.columns.brand, options: toOptions(brands) },
          ]}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty
          filtered={filtered}
          icon={Boxes}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
          action={
            canWrite && (
              <Link href={adminRoutes.newProduct} className={buttonVariants({ size: "sm" })}>
                <Plus className="size-4" aria-hidden />
                {copy.create}
              </Link>
            )
          }
        />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(product) => product.id}
            actions={(product) => (
              <>
                {product.status === "published" && (
                  <IconLink
                    href={localizePath("fa", routes.product(product.slug))}
                    label={`${common.viewOnSite}: ${product.name.fa}`}
                    icon={ExternalLink}
                    external
                  />
                )}
                {canWrite && (
                  <IconAction
                    label={`${product.status === "published" ? common.unpublish : common.publish}: ${product.name.fa}`}
                    icon={product.status === "published" ? EyeOff : Eye}
                    onClick={() => togglePublish(product)}
                  />
                )}
                <IconLink
                  href={adminRoutes.product(product.id) as Route}
                  label={`${common.edit} ${product.name.fa}`}
                />
                {canWrite && (
                  <DeleteAction label={product.name.fa} onConfirm={() => remove(product)} />
                )}
              </>
            )}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
    </ListFrame>
  );
}
