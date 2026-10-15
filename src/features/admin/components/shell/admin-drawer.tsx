"use client";

import { X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { type ReactNode, useId, useRef } from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { Portal } from "@/components/ui/portal";
import { useModal } from "@/hooks/use-modal";

import { adminContent } from "../../content";

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function AdminDrawer({ open, onClose, children }: AdminDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useModal(panelRef, open, onClose);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-60 lg:hidden">
            <m.div
              aria-hidden
              onClick={onClose}
              className="absolute inset-0 bg-night/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="absolute inset-y-0 start-0 flex w-[min(20rem,86vw)] flex-col bg-surface shadow-lift outline-none"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            >
              <h2 id={titleId} className="sr-only">
                {adminContent.shell.navLabel}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={adminContent.shell.closeMenu}
                className="absolute end-3 top-4 icon-btn size-9"
              >
                <X className="size-4.5" aria-hidden />
              </button>
              {children}
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
