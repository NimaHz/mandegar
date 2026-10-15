"use client";

import { PenLine, Plus, Video } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/dates";
import { adminRoutes } from "@/lib/routes";
import type { AdminGuideListItem } from "@/types/admin";
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

const copy = adminContent.guides;
const { common } = adminContent;

interface GuidesListProps {
  result: Paginated<AdminGuideListItem>;
  filtered: boolean;
  canWrite: boolean;
}

export function GuidesList({ result, filtered, canWrite }: GuidesListProps) {
  const { run } = useAdminMutation();

  const columns: Column<AdminGuideListItem>[] = [
    {
      key: "guide",
      header: copy.columns.guide,
      mobile: "primary",
      cell: (guide) => (
        <Link href={adminRoutes.guide(guide.id) as Route} className="group flex items-center gap-3">
          <span className="icon-tile size-11 rounded-field">
            <Video className="size-5" strokeWidth={1.7} aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="line-clamp-1 text-sm font-extrabold text-ink group-hover:text-primary">
              {guide.title.fa}
            </span>
            <CodeText className="text-caption text-muted">{guide.slug}</CodeText>
          </span>
        </Link>
      ),
    },
    {
      key: "video",
      header: copy.columns.video,
      cell: (guide) => (
        <StatusBadge
          tone={guide.videoKind ? "primary" : "chip"}
          label={copy.videoKinds[guide.videoKind ?? "none"]}
          dot={false}
        />
      ),
    },
    {
      key: "steps",
      header: copy.columns.steps,
      cell: (guide) => fill(copy.steps, { count: faNumber(guide.stepCount) }),
    },
    {
      key: "status",
      header: common.status,
      cell: (guide) => (
        <StatusBadge
          tone={guide.published ? "success" : "warning"}
          label={guide.published ? common.published : adminContent.statuses.content.draft}
        />
      ),
    },
    {
      key: "updated",
      header: common.updatedAt,
      className: "whitespace-nowrap",
      cell: (guide) => formatDate("fa", guide.updatedAt),
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
              <Link href={adminRoutes.newGuide} className={buttonVariants()}>
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
            {
              key: "published",
              label: common.status,
              options: [
                { value: "true", label: common.published },
                { value: "false", label: adminContent.statuses.content.draft },
              ],
            },
          ]}
          sort={sortOptions("guides")}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={Video} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(guide) => guide.id}
            actions={(guide) => (
              <>
                {canWrite && (
                  <PublishToggle
                    published={guide.published}
                    label={guide.title.fa}
                    onToggle={() =>
                      void run(
                        () =>
                          apiClient.api.admin
                            .guides({ id: guide.id })
                            .patch({ published: !guide.published }),
                        {
                          success: copy.saved,
                        },
                      )
                    }
                  />
                )}
                <IconLink
                  href={adminRoutes.guide(guide.id) as Route}
                  label={`${common.edit} ${guide.title.fa}`}
                  icon={PenLine}
                />
                {canWrite && (
                  <DeleteAction
                    label={guide.title.fa}
                    onConfirm={() =>
                      void run(() => apiClient.api.admin.guides({ id: guide.id }).delete(), {
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
