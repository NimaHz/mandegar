"use client";

import { type RefObject, useEffect, useEffectEvent } from "react";

export type DismissReason = "outside" | "escape";

export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: (reason: DismissReason) => void,
) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) dismiss("outside");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss("escape");
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, active]);
}
