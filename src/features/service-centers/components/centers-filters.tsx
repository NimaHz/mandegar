"use client";

import { MapPin } from "lucide-react";
import { useQueryStates } from "nuqs";

import { useSharedTransition } from "@/components/providers/transition-provider";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import type { Option } from "@/types/common";

import type { ServiceCentersContent } from "../content";
import { serviceCentersSearchParams } from "../search-params";

interface CentersFiltersProps {
  provinces: Option[];
  copy: ServiceCentersContent["filters"];
}

type KindValue = "all" | "dealer" | "service";

export function CentersFilters({ provinces, copy }: CentersFiltersProps) {
  const { startTransition } = useSharedTransition();
  const [filters, setFilters] = useQueryStates(serviceCentersSearchParams, {
    shallow: false,
    scroll: false,
    startTransition,
  });
  const kinds: Option<KindValue>[] = [
    { value: "all", label: copy.kinds.all },
    { value: "dealer", label: copy.kinds.dealer },
    { value: "service", label: copy.kinds.service },
  ];

  return (
    <div
      role="search"
      aria-label={copy.label}
      className="flex w-full max-w-2xl flex-col gap-3 panel bg-raised p-3 text-start shadow-lift sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <label htmlFor="centers-province" className="sr-only">
          {copy.province}
        </label>
        <Select
          id="centers-province"
          icon={MapPin}
          value={filters.province ?? ""}
          onChange={(event) => void setFilters({ province: event.target.value || null })}
          placeholder={copy.allProvinces}
          options={provinces}
          className="h-12 rounded-field text-lead"
        />
      </div>
      <SegmentedControl
        label={copy.kind}
        options={kinds}
        value={filters.kind ?? "all"}
        onChange={(value) => void setFilters({ kind: value === "all" ? null : value })}
        className="h-12 justify-center p-1 [&>button]:h-9.5 [&>button]:flex-1 sm:[&>button]:flex-none"
      />
    </div>
  );
}
