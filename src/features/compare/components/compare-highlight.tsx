"use client";

import { type ReactNode, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { useLocale } from "@/i18n/locale-provider";

import { compareContent } from "../content";

export function CompareHighlight({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { page } = compareContent[locale];
  const [highlight, setHighlight] = useState(false);

  return (
    <div data-highlight={highlight} className="group/compare flex flex-col gap-5">
      <div className="max-w-sm">
        <Switch
          checked={highlight}
          onCheckedChange={setHighlight}
          label={page.highlight}
          description={page.highlightHint}
        />
      </div>
      {children}
    </div>
  );
}
