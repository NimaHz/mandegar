"use client";

import { ChevronDown, LoaderCircle, LogOut, UserRoundCog } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useId, useRef, useState } from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { Badge } from "@/components/ui/badge";
import { useDismiss } from "@/hooks/use-dismiss";
import { adminRoutes } from "@/lib/routes";
import type { AdminIdentity } from "@/types/admin";

import { adminContent } from "../../content";
import { useSignOut } from "./use-sign-out";
import { UserAvatar } from "./user-avatar";

const { shell, roles } = adminContent;

const itemClass =
  "flex h-10 w-full items-center gap-2.5 rounded-control px-3 text-sm font-semibold transition-colors";

export function UserMenu({ user }: { user: AdminIdentity }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const { signOut, pending } = useSignOut();

  useDismiss(rootRef, open, () => setOpen(false));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={shell.userMenu}
        className="group flex h-10 items-center gap-2 rounded-full p-0.5 pe-2 transition-colors hover:bg-sunken sm:pe-3"
      >
        <UserAvatar name={user.name} />
        <span className="flex flex-col items-start leading-tight max-sm:hidden">
          <span className="max-w-32 truncate text-label font-bold text-ink">{user.name}</span>
          <span className="text-caption text-muted">{roles[user.role]}</span>
        </span>
        <ChevronDown
          className="size-4 text-muted transition-transform duration-200 group-aria-expanded:rotate-180"
          aria-hidden
        />
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            id={menuId}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="absolute end-0 top-full z-50 mt-2 flex w-72 origin-top-left flex-col gap-1 card bg-raised p-2 shadow-lift"
          >
            <div className="flex items-center gap-3 rounded-field bg-sunken/70 p-3">
              <UserAvatar name={user.name} className="size-10" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-extrabold text-ink">{user.name}</span>
                <bdi dir="ltr" className="truncate text-start text-caption text-muted">
                  {user.email}
                </bdi>
              </span>
              <Badge tone="primary" size="sm" className="ms-auto">
                {roles[user.role]}
              </Badge>
            </div>
            <Link
              href={adminRoutes.account}
              onClick={() => setOpen(false)}
              className={`${itemClass} text-ink hover:bg-sunken`}
            >
              <UserRoundCog className="size-4.5 text-muted" aria-hidden />
              {shell.account}
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={pending}
              className={`${itemClass} text-danger hover:bg-danger-soft disabled:opacity-60`}
            >
              {pending ? (
                <LoaderCircle className="size-4.5 animate-spin" aria-hidden />
              ) : (
                <LogOut className="size-4.5 -scale-x-100" aria-hidden />
              )}
              {pending ? shell.signingOut : shell.signOut}
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
