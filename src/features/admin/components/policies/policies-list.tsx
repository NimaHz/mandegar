"use client";

import { PenLine, Plus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/dates";
import { partsMonthsOf } from "@/lib/warranty-terms";
import type { AdminWarrantyPolicy } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { useSheetTarget } from "../../lib/use-sheet-target";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { DeleteAction, IconAction } from "../data/row-actions";
import { PanelHeading } from "../panel-heading";
import { PolicySheet } from "./policy-sheet";

const copy = adminContent.policies;
const { common } = adminContent;

const months = (value: number) => fill(copy.months, { count: faNumber(value) });

export function PoliciesList({
  result,
  filtered,
}: {
  result: Paginated<AdminWarrantyPolicy>;
  filtered: boolean;
}) {
  const { run } = useAdminMutation();
  const sheet = useSheetTarget<AdminWarrantyPolicy>();
  const editing = sheet.target?.mode === "edit" ? sheet.target.item : null;

  const columns: Column<AdminWarrantyPolicy>[] = [
    {
      key: "name",
      header: copy.columns.name,
      mobile: "primary",
      cell: (policy) => (
        <button
          type="button"
          onClick={() => sheet.openEdit(policy)}
          className="flex flex-col gap-0.5 text-start"
        >
          <bdi className="text-sm font-extrabold text-ink hover:text-primary">{policy.name.fa}</bdi>
          <span className="line-clamp-1 text-caption text-muted">{policy.startRule.fa}</span>
        </button>
      ),
    },
    { key: "months", header: copy.columns.months, cell: (policy) => months(policy.months) },
    {
      key: "parts",
      header: copy.columns.parts,
      cell: (policy) => months(partsMonthsOf(policy)),
    },
    { key: "codes", header: copy.columns.codes, cell: (policy) => faNumber(policy.codeCount) },
    {
      key: "effective",
      header: copy.columns.effective,
      className: "whitespace-nowrap",
      cell: (policy) => formatDate("fa", policy.effectiveFrom),
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
            <Button onClick={sheet.openCreate}>
              <Plus className="size-4" aria-hidden />
              {copy.create}
            </Button>
          }
        />
      }
      toolbar={<ListToolbar searchPlaceholder={copy.search} />}
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={ShieldCheck} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(policy) => policy.id}
            actions={(policy) => (
              <>
                <IconAction
                  label={`${common.edit} ${policy.name.fa}`}
                  icon={PenLine}
                  onClick={() => sheet.openEdit(policy)}
                />
                <DeleteAction
                  label={policy.name.fa}
                  onConfirm={() =>
                    void run(
                      () => apiClient.api.admin["warranty-policies"]({ id: policy.id }).delete(),
                      {
                        success: common.deleted,
                      },
                    )
                  }
                />
              </>
            )}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
      {sheet.target && (
        <PolicySheet key={editing?.id ?? "new"} policy={editing} onClose={sheet.close} />
      )}
    </ListFrame>
  );
}
