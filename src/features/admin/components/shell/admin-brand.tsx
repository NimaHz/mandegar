import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { adminRoutes } from "@/lib/routes";

import { adminContent } from "../../content";

export function AdminBrand({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={adminRoutes.dashboard}
      onClick={onNavigate}
      className={cn("group flex items-center gap-2.5 rounded-control", className)}
    >
      <LogoMark className="size-9 transition-transform duration-1000 ease-(--ease-out-expo) group-hover:rotate-[360deg]" />
      <span className="flex flex-col leading-none">
        <span className="font-logo text-xl font-extrabold text-ink">{siteConfig.name.fa}</span>
        <span className="mt-1 text-caption font-bold text-muted">{adminContent.shell.title}</span>
      </span>
    </Link>
  );
}
