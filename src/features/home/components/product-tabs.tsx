"use client";

import { type ReactNode, useState } from "react";

import { panelId, tabId, Tabs } from "@/components/ui/tabs";

type ProductTab = "featured" | "newest";

interface ProductTabsProps {
  label: string;
  labels: Record<ProductTab, string>;
  panels: Record<ProductTab, ReactNode>;
}

const PREFIX = "home-products";

export function ProductTabs({ label, labels, panels }: ProductTabsProps) {
  const [tab, setTab] = useState<ProductTab>("featured");

  return (
    <div className="flex flex-col gap-7">
      <Tabs
        label={label}
        idPrefix={PREFIX}
        value={tab}
        onChange={setTab}
        items={[
          { value: "featured", label: labels.featured },
          { value: "newest", label: labels.newest },
        ]}
        className="self-start"
      />
      <div
        role="tabpanel"
        id={panelId(PREFIX, tab)}
        aria-labelledby={tabId(PREFIX, tab)}
        key={tab}
        className="animate-fade"
      >
        {panels[tab]}
      </div>
    </div>
  );
}
