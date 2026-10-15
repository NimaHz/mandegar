"use client";

import { Menu } from "lucide-react";

import { useDictionary } from "@/i18n/locale-provider";
import { useUiStore } from "@/stores/ui";

import { MOBILE_MENU_ID } from "./mobile-menu-id";

export function MenuTrigger() {
  const { ui } = useDictionary();
  const isOpen = useUiStore((state) => state.isMenuOpen);
  const openMenu = useUiStore((state) => state.openMenu);

  return (
    <button
      type="button"
      onClick={openMenu}
      aria-label={ui.openMenu}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={isOpen ? MOBILE_MENU_ID : undefined}
      className="grid size-10 shrink-0 place-items-center rounded-control border border-line bg-surface text-ink transition-colors hover:border-line-strong hover:bg-sunken lg:hidden"
    >
      <Menu className="size-5" aria-hidden />
    </button>
  );
}
