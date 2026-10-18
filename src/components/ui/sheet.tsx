"use client";

import { X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { type ReactNode, useId, useRef } from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { useModal } from "@/hooks/use-modal";
import { useDictionary } from "@/i18n/locale-provider";

import { Portal } from "./portal";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const { ui } = useDictionary();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useModal(dialogRef, open, onClose);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-60 flex items-end justify-center sm:items-center sm:p-6">
            <m.div
              aria-hidden
              onClick={onClose}
              className="absolute inset-0 bg-night/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <m.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-panel bg-canvas outline-none sm:max-w-xl sm:rounded-panel"
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.6 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                <h2 id={titleId} className="text-base font-extrabold text-ink">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={ui.sheetClose}
                  data-autofocus
                  className="icon-btn size-9 hover:bg-chip"
                >
                  <X className="size-4.5" aria-hidden />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
              {footer && <div className="border-t border-line px-5 pb-safe pt-3">{footer}</div>}
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
