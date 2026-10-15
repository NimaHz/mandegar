"use client";

import { ExternalLink, FileText, PenLine, Plus } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { localizePath } from "@/i18n/paths";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/dates";
import { adminRoutes, routes } from "@/lib/routes";
import type { AdminOption, AdminPostListItem } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { contentStatusTone } from "../../config";
import { adminContent } from "../../content";
import { enumOptions, toOptions } from "../../lib/options";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { PublishToggle } from "../data/publish-toggle";
import { DeleteAction, IconLink } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { ThumbCell } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.posts;
const { common, statuses } = adminContent;

interface PostsListProps {
  result: Paginated<AdminPostListItem>;
  authors: AdminOption[];
  filtered: boolean;
  canWrite: boolean;
}

export function PostsList({ result, authors, filtered, canWrite }: PostsListProps) {
  const { run } = useAdminMutation();

  const columns: Column<AdminPostListItem>[] = [
    {
      key: "post",
      header: copy.columns.post,
      mobile: "primary",
      cell: (post) => (
        <ThumbCell
          media={post.cover}
          square={false}
          title={post.title.fa}
          href={adminRoutes.post(post.id) as Route}
          subtitle={post.author.name.fa}
        />
      ),
    },
    {
      key: "kind",
      header: copy.columns.kind,
      cell: (post) => <StatusBadge tone="chip" label={statuses.postKind[post.kind]} dot={false} />,
    },
    {
      key: "status",
      header: common.status,
      cell: (post) => (
        <StatusBadge tone={contentStatusTone[post.status]} label={statuses.content[post.status]} />
      ),
    },
    {
      key: "published",
      header: copy.columns.published,
      className: "whitespace-nowrap",
      cell: (post) => (post.publishedAt ? formatDate("fa", post.publishedAt) : "—"),
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
              <Link href={adminRoutes.newPost} className={buttonVariants()}>
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
            { key: "kind", label: copy.columns.kind, options: enumOptions(statuses.postKind) },
            { key: "status", label: common.status, options: enumOptions(statuses.content) },
            { key: "authorId", label: copy.columns.author, options: toOptions(authors) },
          ]}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={FileText} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(post) => post.id}
            actions={(post) => (
              <>
                {post.status === "published" && (
                  <IconLink
                    href={localizePath("fa", routes.post(post.slug))}
                    label={`${common.viewOnSite}: ${post.title.fa}`}
                    icon={ExternalLink}
                    external
                  />
                )}
                {canWrite && (
                  <PublishToggle
                    published={post.status === "published"}
                    label={post.title.fa}
                    onToggle={() =>
                      void run(
                        () =>
                          apiClient.api.admin.posts({ id: post.id }).patch({
                            status: post.status === "published" ? "draft" : "published",
                          }),
                        { success: copy.saved },
                      )
                    }
                  />
                )}
                <IconLink
                  href={adminRoutes.post(post.id) as Route}
                  label={`${common.edit} ${post.title.fa}`}
                  icon={PenLine}
                />
                {canWrite && (
                  <DeleteAction
                    label={post.title.fa}
                    onConfirm={() =>
                      void run(() => apiClient.api.admin.posts({ id: post.id }).delete(), {
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
