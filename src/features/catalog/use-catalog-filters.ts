"use client";

import { useQueryStates } from "nuqs";

import { useSharedTransition } from "@/components/providers/transition-provider";

import { catalogSearchParams } from "./search-params";

export function useCatalogFilters() {
  const { isPending, startTransition } = useSharedTransition();
  const [filters, setFilters] = useQueryStates(catalogSearchParams, {
    shallow: false,
    scroll: false,
    history: "push",
    startTransition,
  });
  return { filters, setFilters, isPending };
}
