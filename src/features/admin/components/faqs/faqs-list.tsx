"use client";

import { MessageCircleQuestion, PenLine, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { AdminFaq } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
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
import { PanelHeading } from "../panel-heading";
import { FaqSheet } from "./faq-sheet";

const copy = adminContent.faqs;
const { common, statuses } = adminContent;

interface FaqsListProps {
  result: Paginated<AdminFaq>;
  filtered: boolean;
  canWrite: boolean;
}

export function FaqsList({ result, filtered, canWrite }: FaqsListProps) {
  const { run } = useAdminMutation();
  const sheet = useSheetTarget<AdminFaq>();
  const editing = sheet.target?.mode === "edit" ? sheet.target.item : null;

  const columns: Column<AdminFaq>[] = [
    {
      key: "question",
      header: copy.columns.question,
      mobile: "primary",
      className: "min-w-72",
      cell: (faq) => (
        <button
          type="button"
          onClick={() => sheet.openEdit(faq)}
          className="flex flex-col gap-1 text-start"
        >
          <span className="line-clamp-2 text-sm font-extrabold text-ink hover:text-primary">
            {faq.question.fa}
          </span>
          <span dir="ltr" className="line-clamp-1 text-start text-caption text-muted">
            {faq.question.en}
          </span>
        </button>
      ),
    },
    {
      key: "group",
      header: copy.columns.group,
      cell: (faq) => <StatusBadge tone="chip" label={statuses.faqGroup[faq.group]} dot={false} />,
    },
    { key: "order", header: copy.columns.order, cell: (faq) => faNumber(faq.sortOrder) },
    {
      key: "status",
      header: common.status,
      cell: (faq) => (
        <StatusBadge
          tone={faq.published ? "success" : "chip"}
          label={faq.published ? common.published : common.hidden}
        />
      ),
    },
  ];

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.content}
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
            { key: "group", label: copy.columns.group, options: enumOptions(statuses.faqGroup) },
          ]}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={MessageCircleQuestion} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(faq) => faq.id}
            actions={(faq) => (
              <>
                {canWrite && (
                  <PublishToggle
                    published={faq.published}
                    label={faq.question.fa}
                    onToggle={() =>
                      void run(
                        () =>
                          apiClient.api.admin
                            .faqs({ id: faq.id })
                            .patch({ published: !faq.published }),
                        {
                          success: copy.saved,
                        },
                      )
                    }
                  />
                )}
                <IconAction
                  label={`${common.edit} ${faq.question.fa}`}
                  icon={PenLine}
                  onClick={() => sheet.openEdit(faq)}
                />
                {canWrite && (
                  <DeleteAction
                    label={faq.question.fa}
                    onConfirm={() =>
                      void run(() => apiClient.api.admin.faqs({ id: faq.id }).delete(), {
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
        <FaqSheet
          key={editing?.id ?? "new"}
          faq={editing}
          onClose={sheet.close}
          readOnly={!canWrite}
        />
      )}
    </ListFrame>
  );
}
