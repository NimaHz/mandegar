"use client";

import { PenLine, Plus, Shapes } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { CategoryIcon } from "@/components/icons/category-icon";
import { buttonVariants } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { adminRoutes } from "@/lib/routes";
import type { AdminCategory } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { sortOptions } from "../../lib/options";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { PublishToggle } from "../data/publish-toggle";
import { DeleteAction, IconLink } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { CodeText } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.categories;
const { common } = adminContent;

interface CategoriesListProps {
  result: Paginated<AdminCategory>;
  parents: Record<string, string>;
  filtered: boolean;
  canWrite: boolean;
}

export function CategoriesList({ result, parents, filtered, canWrite }: CategoriesListProps) {
  const { run } = useAdminMutation();

  const columns: Column<AdminCategory>[] = [
    {
      key: "category",
      header: copy.columns.category,
      mobile: "primary",
      cell: (category) => (
        <Link
          href={adminRoutes.category(category.id) as Route}
          className="group flex items-center gap-3"
        >
          <span className="icon-tile size-11 rounded-field">
            <CategoryIcon name={category.icon} className="size-5" strokeWidth={1.7} />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-extrabold text-ink group-hover:text-primary">
              {category.name.fa}
            </span>
            <CodeText className="text-caption text-muted">{category.slug}</CodeText>
          </span>
        </Link>
      ),
    },
    {
      key: "parent",
      header: copy.columns.parent,
      cell: (category) =>
        category.parentId ? (
          (parents[category.parentId] ?? "—")
        ) : (
          <span className="text-muted">{copy.root}</span>
        ),
    },
    {
      key: "products",
      header: copy.columns.products,
      cell: (category) => faNumber(category.productCount),
    },
    { key: "order", header: copy.columns.order, cell: (category) => faNumber(category.sortOrder) },
    {
      key: "status",
      header: common.status,
      cell: (category) => (
        <StatusBadge
          tone={category.published ? "success" : "chip"}
          label={category.published ? common.published : common.hidden}
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
              <Link href={adminRoutes.newCategory} className={buttonVariants()}>
                <Plus className="size-4" aria-hidden />
                {copy.create}
              </Link>
            )
          }
        />
      }
      toolbar={<ListToolbar searchPlaceholder={copy.search} sort={sortOptions("categories")} />}
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={Shapes} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(category) => category.id}
            actions={(category) => (
              <>
                {canWrite && (
                  <PublishToggle
                    published={category.published}
                    label={category.name.fa}
                    onToggle={() =>
                      void run(
                        () =>
                          apiClient.api.admin
                            .categories({ id: category.id })
                            .patch({ published: !category.published }),
                        { success: copy.saved },
                      )
                    }
                  />
                )}
                <IconLink
                  href={adminRoutes.category(category.id) as Route}
                  label={`${common.edit} ${category.name.fa}`}
                  icon={PenLine}
                />
                {canWrite && (
                  <DeleteAction
                    label={category.name.fa}
                    onConfirm={() =>
                      void run(() => apiClient.api.admin.categories({ id: category.id }).delete(), {
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
    </ListFrame>
  );
}
