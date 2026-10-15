"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-provider";

import { catalogContent } from "../content";
import { clearedCatalogFilters } from "../filters";
import { useCatalogFilters } from "../use-catalog-filters";

export function ClearFiltersButton() {
  const locale = useLocale();
  const { setFilters } = useCatalogFilters();

  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-1"
      onClick={() => void setFilters(clearedCatalogFilters)}
    >
      {catalogContent[locale].listing.emptyAction}
    </Button>
  );
}
