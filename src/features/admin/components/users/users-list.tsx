"use client";

import { KeyRound, PenLine, UserPlus, UsersRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { apiClient } from "@/lib/api-client";
import { formatDateTime } from "@/lib/dates";
import type { AdminUser } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { useSheetTarget } from "../../lib/use-sheet-target";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { IconAction } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { PanelHeading } from "../panel-heading";
import { UserAvatar } from "../shell/user-avatar";
import { TempPasswordSheet } from "./temp-password-sheet";
import { UserSheet } from "./user-sheet";

const copy = adminContent.users;
const { roles, common } = adminContent;

interface UsersListProps {
  result: Paginated<AdminUser>;
  currentUserId: string;
  filtered: boolean;
}

export function UsersList({ result, currentUserId, filtered }: UsersListProps) {
  const { run } = useAdminMutation();
  const sheet = useSheetTarget<AdminUser>();
  const [temp, setTemp] = useState<{ name: string; password: string } | null>(null);
  const editing = sheet.target?.mode === "edit" ? sheet.target.item : null;

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: copy.columns.user,
      mobile: "primary",
      cell: (user) => (
        <span className="flex items-center gap-3">
          <UserAvatar name={user.name} className={user.active ? undefined : "bg-chip text-muted"} />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-1.5 truncate text-sm font-extrabold text-ink">
              <bdi>{user.name}</bdi>
              {user.id === currentUserId && (
                <StatusBadge tone="primary" label={copy.you} dot={false} />
              )}
            </span>
            <bdi dir="ltr" className="truncate text-start text-caption text-muted">
              {user.email}
            </bdi>
          </span>
        </span>
      ),
    },
    {
      key: "role",
      header: copy.columns.role,
      cell: (user) => (
        <StatusBadge
          tone={user.role === "owner" ? "solid" : "chip"}
          label={roles[user.role]}
          dot={false}
        />
      ),
    },
    {
      key: "security",
      header: copy.columns.security,
      cell: (user) => (
        <span className="flex flex-wrap gap-1.5">
          {!user.active && <StatusBadge tone="danger" label={copy.inactive} />}
          {user.totpEnabled && <StatusBadge tone="success" label={copy.twoFactor} />}
          {user.mustChangePassword && <StatusBadge tone="warning" label={copy.pendingPassword} />}
        </span>
      ),
    },
    {
      key: "lastLogin",
      header: copy.columns.lastLogin,
      className: "whitespace-nowrap",
      cell: (user) =>
        user.lastLoginAt ? (
          formatDateTime("fa", user.lastLoginAt)
        ) : (
          <span className="text-muted">{copy.never}</span>
        ),
    },
  ];

  const resetPassword = (user: AdminUser) =>
    void run(() => apiClient.api.admin.users({ id: user.id })["reset-password"].post(), {
      onSuccess: (data) => setTemp({ name: user.name, password: data.temporaryPassword }),
    });

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.settings}
          title={copy.title}
          description={copy.description}
          action={
            <Button onClick={sheet.openCreate}>
              <UserPlus className="size-4" aria-hidden />
              {copy.invite}
            </Button>
          }
        />
      }
      toolbar={<ListToolbar searchPlaceholder={copy.search} />}
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={UsersRound} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(user) => user.id}
            actions={(user) => (
              <>
                {user.id !== currentUserId && (
                  <ConfirmButton
                    label={`${copy.resetPassword} ${user.name}`}
                    confirmLabel={copy.resetConfirm}
                    onConfirm={() => resetPassword(user)}
                    className="size-9 rounded-control hover:bg-warning-soft hover:text-warning"
                    armedClassName="w-auto px-2"
                  >
                    <KeyRound className="size-4.5" strokeWidth={1.9} aria-hidden />
                  </ConfirmButton>
                )}
                <IconAction
                  label={`${common.edit} ${user.name}`}
                  icon={PenLine}
                  onClick={() => sheet.openEdit(user)}
                />
              </>
            )}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
      {sheet.target && (
        <UserSheet
          key={editing?.id ?? "new"}
          user={editing}
          self={editing?.id === currentUserId}
          onClose={sheet.close}
          onCreated={(name, password) => {
            sheet.close();
            setTemp({ name, password });
          }}
        />
      )}
      <TempPasswordSheet value={temp} onClose={() => setTemp(null)} />
    </ListFrame>
  );
}
