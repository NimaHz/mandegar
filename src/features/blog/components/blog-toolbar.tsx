"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import type { Option } from "@/types/common";
import type { PostKind } from "@/types/content";

import { useBlogFilters } from "../use-blog-filters";

type KindFilter = PostKind | "all";

interface BlogToolbarProps {
  label: string;
  options: Option<KindFilter>[];
  countLabel: string;
}

export function BlogToolbar({ label, options, countLabel }: BlogToolbarProps) {
  const { filters, setFilters } = useBlogFilters();

  const onChange = (value: KindFilter) =>
    void setFilters({ kind: value === "all" ? null : value, page: null });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SegmentedControl
        label={label}
        options={options}
        value={filters.kind ?? "all"}
        onChange={onChange}
        className="min-w-0 self-start"
      />
      <p role="status" className="shrink-0 text-label font-semibold text-muted">
        {countLabel}
      </p>
    </div>
  );
}
