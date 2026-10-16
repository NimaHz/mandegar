import type { Locale } from "@/i18n/config";
import type { WarrantyLookup } from "@/types/warranty";

import type { WarrantyContent } from "../content";
import { FoundResult } from "./found-result";
import { NotFoundResult, RateLimitedResult } from "./miss-result";

interface WarrantyResultProps {
  lookup: Exclude<WarrantyLookup, { status: "invalid" }>;
  locale: Locale;
  content: WarrantyContent;
}

export const HEADING_ID = "warranty-result-heading";

export function WarrantyResult({ lookup, locale, content }: WarrantyResultProps) {
  switch (lookup.status) {
    case "found":
      return (
        <FoundResult
          match={lookup.match}
          locale={locale}
          content={content}
          headingId={HEADING_ID}
        />
      );
    case "not-found":
      return <NotFoundResult locale={locale} content={content} headingId={HEADING_ID} />;
    case "rate-limited":
      return <RateLimitedResult locale={locale} content={content} headingId={HEADING_ID} />;
  }
}
