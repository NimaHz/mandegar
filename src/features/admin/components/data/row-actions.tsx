"use client";

import type { LucideIcon } from "lucide-react";
import { PenLine, Trash } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { cn } from "@/lib/cn";

import { adminContent } from "../../content";

const { common } = adminContent;

export function IconLink({
  href,
  label,
  icon: Icon = PenLine,
  external,
}: {
  href: Route;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      target={external ? "_blank" : undefined}
      className="icon-btn size-9"
    >
      <Icon className="size-4.5" strokeWidth={1.9} aria-hidden />
    </Link>
  );
}

export function IconAction({
  label,
  icon: Icon,
  onClick,
  disabled,
  className,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("icon-btn size-9 disabled:opacity-40", className)}
    >
      <Icon className="size-4.5" strokeWidth={1.9} aria-hidden />
    </button>
  );
}

export function DeleteAction({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return (
    <ConfirmButton
      label={`${common.delete} ${label}`}
      confirmLabel={common.deleteConfirm}
      onConfirm={onConfirm}
      className="size-9 rounded-control"
      armedClassName="w-auto px-2"
    >
      <Trash className="size-4.5" strokeWidth={1.9} aria-hidden />
    </ConfirmButton>
  );
}
