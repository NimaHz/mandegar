"use client";

import { useQueryStates } from "nuqs";

import { useSharedTransition } from "@/components/providers/transition-provider";

import { blogSearchParams } from "./search-params";

export function useBlogFilters() {
  const { isPending, startTransition } = useSharedTransition();
  const [filters, setFilters] = useQueryStates(blogSearchParams, {
    shallow: false,
    scroll: false,
    startTransition,
  });
  return { filters, setFilters, isPending };
}
