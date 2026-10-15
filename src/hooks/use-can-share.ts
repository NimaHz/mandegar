"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const canShare = () => typeof navigator.share === "function";

export function useCanShare() {
  return useSyncExternalStore(subscribe, canShare, () => false);
}
