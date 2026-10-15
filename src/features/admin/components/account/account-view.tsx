import { TriangleAlert } from "lucide-react";

import type { AdminIdentity } from "@/types/admin";

import { adminContent } from "../../content";
import { PanelHeading } from "../panel-heading";
import { UserAvatar } from "../shell/user-avatar";
import { PasswordCard } from "./password-card";
import { SessionsCard } from "./sessions-card";
import { TotpCard } from "./totp-card";

const copy = adminContent.account;

export function AccountView({ user }: { user: AdminIdentity }) {
  return (
    <div className="flex flex-col gap-5">
      <PanelHeading title={copy.title} description={copy.description} />
      {user.mustChangePassword && (
        <p
          role="alert"
          className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning-soft px-4 py-3 text-sm font-bold text-warning"
        >
          <TriangleAlert className="mt-0.5 size-4.5 shrink-0" aria-hidden />
          {copy.mustChange}
        </p>
      )}
      <div className="flex items-center gap-4 card p-4 shadow-card sm:p-5">
        <UserAvatar name={user.name} className="size-14 text-lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-display text-xl font-black text-ink">
            <bdi>{user.name}</bdi>
          </span>
          <bdi dir="ltr" className="truncate text-start text-sm text-muted">
            {user.email}
          </bdi>
        </div>
        <span className="ms-auto rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary">
          {adminContent.roles[user.role]}
        </span>
      </div>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <PasswordCard mustChange={user.mustChangePassword} />
        {!user.mustChangePassword && <TotpCard enabled={user.totpEnabled} />}
      </div>
      {!user.mustChangePassword && <SessionsCard />}
    </div>
  );
}
