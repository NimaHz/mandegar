"use client";

import { PenLine, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { AdminAuthor } from "@/types/admin";
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
import { CodeText, ThumbCell } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";
import { AuthorSheet } from "./author-sheet";

const copy = adminContent.authors;
const { common } = adminContent;

interface AuthorsListProps {
  result: Paginated<AdminAuthor>;
  filtered: boolean;
  canWrite: boolean;
}

export function AuthorsList({ result, filtered, canWrite }: AuthorsListProps) {
  const { run } = useAdminMutation();
  const sheet = useSheetTarget<AdminAuthor>();
  const editing = sheet.target?.mode === "edit" ? sheet.target.item : null;

  const columns: Column<AdminAuthor>[] = [
    {
      key: "author",
      header: copy.columns.author,
      mobile: "primary",
      cell: (author) => (
        <button type="button" onClick={() => sheet.openEdit(author)} className="text-start">
          <ThumbCell
            media={author.avatar}
            title={author.name.fa}
            subtitle={<CodeText>{author.slug}</CodeText>}
          />
        </button>
      ),
    },
    { key: "role", header: copy.columns.role, cell: (author) => author.role.fa },
    { key: "posts", header: copy.columns.posts, cell: (author) => faNumber(author.postCount) },
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
      toolbar={<ListToolbar searchPlaceholder={copy.search} />}
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={PenLine} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(author) => author.id}
            actions={(author) => (
              <>
                <IconAction
                  label={`${common.edit} ${author.name.fa}`}
                  icon={PenLine}
                  onClick={() => sheet.openEdit(author)}
                />
                {canWrite && (
                  <DeleteAction
                    label={author.name.fa}
                    onConfirm={() =>
                      void run(() => apiClient.api.admin.authors({ id: author.id }).delete(), {
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
        <AuthorSheet
          key={editing?.id ?? "new"}
          author={editing}
          onClose={sheet.close}
          readOnly={!canWrite}
        />
      )}
    </ListFrame>
  );
}
