"use client";

import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";

import { IconSwap } from "@/components/motion/icon-swap";
import { useTheme } from "@/hooks/use-theme";
import { fill } from "@/i18n/fill";
import { useDictionary } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { type ResolvedTheme, resolveTheme, type ThemePreference } from "@/lib/theme";

const opposite: Record<ResolvedTheme, ResolvedTheme> = { light: "dark", dark: "light" };

const icons: Record<ThemePreference, LucideIcon> = { light: Sun, dark: Moon, system: Monitor };

const nextPreference = (preference: ThemePreference): ThemePreference => {
  const system = resolveTheme("system");
  return preference === "system" || preference === system ? opposite[system] : "system";
};

export function ThemeToggle({ className }: { className?: string }) {
  const { ui } = useDictionary();
  const { preference, setTheme } = useTheme();
  const [interacted, setInteracted] = useState(false);
  const labels: Record<ThemePreference, string> = {
    light: ui.themeLight,
    dark: ui.themeDark,
    system: ui.themeSystem,
  };
  const label = fill(ui.themeCurrent, { theme: labels[preference] });
  const Icon = icons[preference];

  const onClick = () => {
    setInteracted(true);
    setTheme(nextPreference(preference));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-control text-ink-soft transition-colors hover:bg-sunken hover:text-ink",
        className,
      )}
    >
      <IconSwap swapKey={preference} instant={!interacted}>
        <Icon className="size-5" strokeWidth={1.8} />
      </IconSwap>
    </button>
  );
}
