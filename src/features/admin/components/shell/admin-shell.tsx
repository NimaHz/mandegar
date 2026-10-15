"use client";

import { ExternalLink, LoaderCircle, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";

import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { AdminIdentity } from "@/types/admin";

import { adminContent } from "../../content";
import { AdminBrand } from "./admin-brand";
import { AdminBreadcrumbs } from "./admin-breadcrumbs";
import { AdminDrawer } from "./admin-drawer";
import { type AdminCounts, AdminNavList } from "./admin-nav-list";
import { useSignOut } from "./use-sign-out";
import { UserAvatar } from "./user-avatar";
import { UserMenu } from "./user-menu";

const { shell, roles } = adminContent;

interface AdminShellProps {
  user: AdminIdentity;
  counts: AdminCounts;
  children: ReactNode;
}

function SidebarFooter({ user }: { user: AdminIdentity }) {
  const { signOut, pending } = useSignOut();

  return (
    <div className="flex items-center gap-3 border-t border-line p-3">
      <UserAvatar name={user.name} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-label font-bold text-ink">{user.name}</span>
        <span className="text-caption text-muted">{roles[user.role]}</span>
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={pending}
        aria-label={shell.signOut}
        title={shell.signOut}
        className="icon-btn size-9 hover:bg-danger-soft hover:text-danger"
      >
        {pending ? (
          <LoaderCircle className="size-4.5 animate-spin" aria-hidden />
        ) : (
          <LogOut className="size-4.5 -scale-x-100" aria-hidden />
        )}
      </button>
    </div>
  );
}

function SidebarBody({
  user,
  counts,
  onNavigate,
}: {
  user: AdminIdentity;
  counts: AdminCounts;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center px-5">
        <AdminBrand onNavigate={onNavigate} />
      </div>
      <nav
        aria-label={shell.navLabel}
        className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-6"
        data-lenis-prevent
      >
        <AdminNavList permissions={user.permissions} counts={counts} onNavigate={onNavigate} />
      </nav>
      <SidebarFooter user={user} />
    </>
  );
}

export function AdminShell({ user, counts, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a
        href="#admin-main"
        className="sr-only z-80 rounded-control bg-inverse px-4 py-2 text-sm font-bold text-on-inverse focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {shell.skipToContent}
      </a>
      <div className="border-e border-line bg-surface max-lg:hidden">
        <aside className="sticky top-0 flex h-dvh flex-col">
          <SidebarBody user={user} counts={counts} />
        </aside>
      </div>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-line bg-canvas/85 px-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={shell.openMenu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="icon-btn size-10 text-ink lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <LogoMark className="size-7 lg:hidden" />
          <div className="min-w-0 flex-1 ps-1 max-sm:hidden">
            <AdminBreadcrumbs />
          </div>
          <div className="ms-auto flex items-center gap-1">
            <Link
              href={localizePath("fa", routes.home)}
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-control px-3 text-label font-bold text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
            >
              <ExternalLink className="size-4" aria-hidden />
              <span className="max-md:sr-only">{shell.viewSite}</span>
            </Link>
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>
        <div className="border-b border-line px-4 py-2.5 sm:hidden">
          <AdminBreadcrumbs />
        </div>
        <main
          id="admin-main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-full max-w-[86rem]">{children}</div>
        </main>
      </div>
      <AdminDrawer open={menuOpen} onClose={closeMenu}>
        <SidebarBody user={user} counts={counts} onNavigate={closeMenu} />
      </AdminDrawer>
    </div>
  );
}
