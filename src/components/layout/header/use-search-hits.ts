"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/config";
import { apiClient, apiResult } from "@/lib/api-client";
import { toSearchKey } from "@/lib/persian";
import type { SearchHit } from "@/types/catalog";

const DEBOUNCE_MS = 180;
const MIN_QUERY_LENGTH = 2;

const isSearchable = (term: string) =>
  toSearchKey(term).replace(/-/g, "").length >= MIN_QUERY_LENGTH;

interface SearchState {
  query: string;
  hits: SearchHit[];
  loading: boolean;
}

export function useSearchHits(query: string, locale: Locale) {
  const [state, setState] = useState<SearchState>({ query: "", hits: [], loading: false });
  const term = query.trim();
  const searchable = isSearchable(term);

  useEffect(() => {
    if (!searchable) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState((current) => ({ ...current, loading: true }));
      const result = await apiResult(
        apiClient.api.search.get({
          query: { q: term, locale },
          fetch: { signal: controller.signal },
        }),
      );
      if (controller.signal.aborted) return;
      setState({ query: term, hits: result.ok ? result.data.hits : [], loading: false });
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term, searchable, locale]);

  if (!searchable) return { hits: [], loading: false, settled: false, searchable };
  return {
    hits: state.hits,
    loading: state.loading,
    settled: state.query === term && !state.loading,
    searchable,
  };
}
