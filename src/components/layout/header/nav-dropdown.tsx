"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

import { NavIndicator } from "./nav-indicator";
import { menuPanelVariants, navItemClass } from "./nav-styles";
import { useHeaderPopover } from "./use-header-popover";

interface NavDropdownProps {
  label: string;
  indicatorId: string;
  active: boolean;
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
}

export function NavDropdown({
  label,
  indicatorId,
  active,
  panelClassName,
  children,
}: NavDropdownProps) {
  const { isOpen, setIsOpen, close, containerRef, triggerRef, onBlur } = useHeaderPopover();
  const panelId = useId();

  return (
    <div ref={containerRef} className="relative flex" onBlur={onBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(navItemClass(active || isOpen), isOpen && !active && "bg-sunken")}
      >
        {active && <NavIndicator layoutId={indicatorId} />}
        {label}
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-300", isOpen && "rotate-180")}
          aria-hidden
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            id={panelId}
            variants={menuPanelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={cn("absolute start-0 top-full z-50 mt-3 card shadow-lift", panelClassName)}
          >
            {children(close)}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
