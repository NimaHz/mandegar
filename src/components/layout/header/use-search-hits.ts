"use client";

import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/config";
import type { SearchHit } from "@/types/catalog";

const DEBOUNCE_MS = 180;

interface SearchState {
  query: string;
  hits: SearchHit[];
  loading: boolean;
}

export function useSearchHits(query: string, locale: Locale) {
  const [state, setState] = useState<SearchState>({ query: "", hits: [], loading: false });
  const term = query.trim();

  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState((current) => ({ ...current, loading: true }));
      try {
        const params = new URLSearchParams({ q: term, locale });
        const response = await fetch(`/api/search?${params}`, { signal: controller.signal });
        const data: { hits?: SearchHit[] } = response.ok ? await response.json() : {};
        setState({ query: term, hits: data.hits ?? [], loading: false });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ query: term, hits: [], loading: false });
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [term, locale]);

  if (!term) return { hits: [], loading: false, settled: false };
  return {
    hits: state.hits,
    loading: state.loading,
    settled: state.query === term && !state.loading,
  };
}
