"use client";

import type { Route } from "next";
import { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useNavigationPending, useTrackNavigation } from "@/stores/navigation";

export function LinkPending() {
  const { pending } = useLinkStatus();
  useTrackNavigation(pending);
  return null;
}

export function useTrackedNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  useTrackNavigation(isPending);

  const navigate = (href: Route) => startTransition(() => router.push(href));

  const navigateFrom = (href: Route) => (event: { preventDefault: () => void }) => {
    event.preventDefault();
    navigate(href);
  };

  return { navigate, navigateFrom };
}

export type TrackedNavigation = ReturnType<typeof useTrackedNavigation>;

export function NavigationProgress() {
  const pending = useNavigationPending();
  if (!pending) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-80 h-0.5 animate-fade overflow-hidden"
      style={{ animationDelay: "150ms" }}
    >
      <div className="h-full w-2/5 rounded-full bg-primary motion-safe:animate-progress motion-reduce:w-full" />
    </div>
  );
}
