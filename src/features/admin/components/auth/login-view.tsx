import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { siteConfig } from "@/config/site";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

import { adminContent } from "../../content";
import { LoginForm } from "./login-form";

const copy = adminContent.login;

export function LoginView({ next }: { next: string }) {
  return (
    <div className="bg-glow bg-dots relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Link
          href={localizePath("fa", routes.home)}
          className="inline-flex h-10 items-center gap-1.5 rounded-control px-3 text-label font-bold text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
        >
          <ArrowLeft className="size-4 rotate-180" aria-hidden />
          {copy.backToSite}
        </Link>
        <ThemeToggle />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        <div className="flex w-full max-w-[25rem] flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="grid size-16 place-items-center rounded-panel border border-line bg-surface shadow-card">
              <LogoMark className="size-10" title={siteConfig.name.fa} />
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-extrabold text-primary">{copy.eyebrow}</span>
              <h1 className="font-display text-3xl font-black text-ink">{copy.title}</h1>
              <p className="text-sm leading-7 text-body">{copy.description}</p>
            </div>
          </div>
          <div className="card bg-raised p-5 shadow-lift sm:p-7">
            <LoginForm next={next} />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-center text-caption text-muted">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
            {copy.footnote}
          </p>
        </div>
      </main>
    </div>
  );
}
