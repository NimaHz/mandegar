"use client";

import { type RefObject, useEffect, useEffectEvent, useId } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusableIn = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0,
  );

const openModals: string[] = [];

export function useModal(
  dialogRef: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  const close = useEffectEvent(onClose);
  const modalId = useId();

  useEffect(() => {
    if (!open) return;
    openModals.push(modalId);
    return () => {
      const index = openModals.lastIndexOf(modalId);
      if (index >= 0) openModals.splice(index, 1);
    };
  }, [open, modalId]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) {
      const initial =
        dialog.querySelector<HTMLElement>("[data-autofocus]") ?? focusableIn(dialog)[0];
      (initial ?? dialog).focus({ preventScroll: true });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (openModals.at(-1) !== modalId) return;
      if (event.key === "Escape") {
        close();
        return;
      }
      const container = dialogRef.current;
      if (event.key !== "Tab" || !container) return;
      const items = focusableIn(container);
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement;
      const outside = !container.contains(active);
      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open, dialogRef, modalId]);
}
