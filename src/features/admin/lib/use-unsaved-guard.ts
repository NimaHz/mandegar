"use client";

import { useEffect } from "react";

import { isRecord } from "@/lib/guards";

import { adminContent } from "../content";

const SHADOW_KEY = "unsavedShadow";
const GUARDED_KEY = "unsavedGuarded";

const historyState = () => (isRecord(window.history.state) ? window.history.state : {});

const onEntry = (key: string) => historyState()[key] === true;

const pushGuarded = () =>
  window.history.pushState(
    { ...historyState(), [SHADOW_KEY]: false, [GUARDED_KEY]: true },
    "",
    window.location.href,
  );

const guardHistory = () => {
  if (onEntry(GUARDED_KEY)) return;
  window.history.replaceState({ ...historyState(), [SHADOW_KEY]: true }, "");
  pushGuarded();
};

const guard = { dirty: 0, leaving: false, releasing: false };

export const leaveGuardedEntry = () =>
  new Promise<void>((resolve) => {
    if (!onEntry(GUARDED_KEY)) {
      resolve();
      return;
    }
    const onPopState = (event: PopStateEvent) => {
      event.stopImmediatePropagation();
      window.removeEventListener("popstate", onPopState, true);
      window.history.replaceState({ ...historyState(), [SHADOW_KEY]: false }, "");
      guard.releasing = false;
      resolve();
    };
    guard.releasing = true;
    window.addEventListener("popstate", onPopState, true);
    window.history.back();
  });

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    const href = window.location.href;
    const onPopState = (event: PopStateEvent) => {
      if (guard.releasing || window.location.href !== href || !onEntry(SHADOW_KEY)) return;
      event.stopImmediatePropagation();
      if (guard.dirty > 0 && !guard.leaving && !window.confirm(adminContent.common.leaveConfirm)) {
        pushGuarded();
        return;
      }
      guard.leaving = true;
      window.history.back();
    };
    window.addEventListener("popstate", onPopState, true);
    if (!dirty) return () => window.removeEventListener("popstate", onPopState, true);
    guard.dirty += 1;
    guard.leaving = false;
    guardHistory();
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey
      )
        return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname)
        return;
      if (!window.confirm(adminContent.common.leaveConfirm)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      guard.dirty -= 1;
      window.removeEventListener("popstate", onPopState, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}
