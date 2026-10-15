"use client";

import { MapPinned, PenLine, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { provinceName, provinces } from "@/lib/provinces";
import type { AdminOption, AdminServiceCenter } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { enumOptions } from "../../lib/options";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { useSheetTarget } from "../../lib/use-sheet-target";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { PublishToggle } from "../data/publish-toggle";
import { DeleteAction, IconAction } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { CodeText } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";
import { CenterSheet } from "./center-sheet";

const copy = adminContent.centers;
const { common, statuses } = adminContent;

interface CentersListProps {
  result: Paginated<AdminServiceCenter>;
  categories: AdminOption[];
  filtered: boolean;
  canWrite: boolean;
}

export function CentersList({ result, categories, filtered, canWrite }: CentersListProps) {
  const { run } = useAdminMutation();
  const sheet = useSheetTarget<AdminServiceCenter>();
  const editing = sheet.target?.mode === "edit" ? sheet.target.item : null;

  const columns: Column<AdminServiceCenter>[] = [
    {
      key: "center",
      header: copy.columns.center,
      mobile: "primary",
      cell: (center) => (
        <button
          type="button"
          onClick={() => sheet.openEdit(center)}
          className="flex flex-col gap-0.5 text-start"
        >
          <span className="text-sm font-extrabold text-ink hover:text-primary">
            {center.name.fa}
          </span>
          <span className="line-clamp-1 text-caption text-muted">{center.address.fa}</span>
        </button>
      ),
    },
    {
      key: "kind",
      header: copy.columns.kind,
      cell: (center) => (
        <StatusBadge tone="chip" label={statuses.centerKind[center.kind]} dot={false} />
      ),
    },
    {
      key: "province",
      header: copy.columns.province,
      cell: (center) => `${provinceName("fa", center.province)}، ${center.city.fa}`,
    },
    {
      key: "phones",
      header: copy.columns.phones,
      cell: (center) => <CodeText className="text-caption">{center.phones[0] ?? "—"}</CodeText>,
    },
    {
      key: "status",
      header: common.status,
      cell: (center) => (
        <StatusBadge
          tone={center.active ? "success" : "chip"}
          label={center.active ? common.active : common.inactive}
        />
      ),
    },
  ];

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.service}
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
      toolbar={
        <ListToolbar
          searchPlaceholder={copy.search}
          filters={[
            {
              key: "province",
              label: copy.columns.province,
              options: provinces.map((province) => ({
                value: province.code,
                label: province.name.fa,
              })),
            },
            { key: "kind", label: copy.columns.kind, options: enumOptions(statuses.centerKind) },
          ]}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={MapPinned} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(center) => center.id}
            actions={(center) => (
              <>
                {canWrite && (
                  <PublishToggle
                    published={center.active}
                    label={center.name.fa}
                    onToggle={() =>
                      void run(
                        () =>
                          apiClient.api.admin["service-centers"]({ id: center.id }).patch({
                            active: !center.active,
                          }),
                        { success: copy.saved },
                      )
                    }
                  />
                )}
                <IconAction
                  label={`${common.edit} ${center.name.fa}`}
                  icon={PenLine}
                  onClick={() => sheet.openEdit(center)}
                />
                {canWrite && (
                  <DeleteAction
                    label={center.name.fa}
                    onConfirm={() =>
                      void run(
                        () => apiClient.api.admin["service-centers"]({ id: center.id }).delete(),
                        {
                          success: common.deleted,
                        },
                      )
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
        <CenterSheet
          key={editing?.id ?? "new"}
          center={editing}
          categories={categories}
          onClose={sheet.close}
          readOnly={!canWrite}
        />
      )}
    </ListFrame>
  );
}
