"use client";

import { createContext, type ReactNode, use, useState } from "react";

import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";

import { adminContent } from "../../content";

export type ContentLang = "fa" | "en";

interface LangContextValue {
  lang: ContentLang;
  setLang: (lang: ContentLang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangScope({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<ContentLang>("fa");
  return <LangContext value={{ lang, setLang }}>{children}</LangContext>;
}

export function useContentLang() {
  const scope = use(LangContext);
  const [own, setOwn] = useState<ContentLang>("fa");
  return scope ? { lang: scope.lang, setLang: scope.setLang } : { lang: own, setLang: setOwn };
}

export const langMeta: Record<ContentLang, { short: string; label: string; dir: "rtl" | "ltr" }> = {
  fa: { short: adminContent.common.faShort, label: adminContent.common.fa, dir: "rtl" },
  en: { short: adminContent.common.enShort, label: adminContent.common.en, dir: "ltr" },
};

export type LangState = "filled" | "empty" | "error";

interface LangSwitchProps {
  value?: ContentLang;
  onChange?: (lang: ContentLang) => void;
  states?: Partial<Record<ContentLang, LangState>>;
  className?: string;
}

const dotClass: Record<LangState, string> = {
  filled: "bg-success",
  empty: "bg-warning",
  error: "bg-danger",
};

export function LangSwitch({ value, onChange, states, className }: LangSwitchProps) {
  const scope = use(LangContext);
  const lang = value ?? scope?.lang ?? "fa";
  const change = onChange ?? scope?.setLang;

  return (
    <div
      role="group"
      aria-label={adminContent.common.langSwitch}
      className={cn(
        "inline-flex shrink-0 gap-0.5 rounded-lg border border-line bg-sunken p-0.5",
        className,
      )}
    >
      {(["fa", "en"] as const).map((option) => {
        const active = option === lang;
        const state = states?.[option];
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => change?.(option)}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-md px-2 text-caption font-extrabold transition-colors",
              active ? "bg-inverse text-on-inverse" : "text-muted hover:text-ink",
            )}
          >
            {state && <span aria-hidden className={cn("size-1.5 rounded-full", dotClass[state])} />}
            <span lang={option}>{langMeta[option].short}</span>
            {state && state !== "filled" && (
              <span className="sr-only">
                {fill(adminContent.common.langMissing, { lang: langMeta[option].label })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
