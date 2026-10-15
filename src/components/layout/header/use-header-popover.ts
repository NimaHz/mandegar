"use client";

import { type FocusEvent, useRef, useState } from "react";

import { type DismissReason, useDismiss } from "@/hooks/use-dismiss";

export function useHeaderPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => setIsOpen(false);

  useDismiss(containerRef, isOpen, (reason: DismissReason) => {
    const hadFocus = containerRef.current?.contains(document.activeElement) ?? false;
    setIsOpen(false);
    if (reason === "escape" && hadFocus) triggerRef.current?.focus({ preventScroll: true });
  });

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && !event.currentTarget.contains(next)) setIsOpen(false);
  };

  return { isOpen, setIsOpen, close, containerRef, triggerRef, onBlur };
}
