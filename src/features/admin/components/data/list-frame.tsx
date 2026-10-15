"use client";

import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { PendingRegion, TransitionProvider } from "@/components/providers/transition-provider";
import { EmptyState } from "@/components/ui/empty-state";

import { adminContent } from "../../content";

const { common } = adminContent;

interface ListFrameProps {
  heading: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function ListFrame({ heading, toolbar, children }: ListFrameProps) {
  return (
    <TransitionProvider>
      <div className="flex flex-col gap-5">
        {heading}
        {toolbar}
        <PendingRegion className="flex flex-col gap-4">{children}</PendingRegion>
      </div>
    </TransitionProvider>
  );
}

interface ListEmptyProps {
  filtered: boolean;
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ListEmpty({ filtered, icon, title, description, action }: ListEmptyProps) {
  return filtered ? (
    <EmptyState icon={SearchX} title={common.noResults} description={common.noResultsHint} />
  ) : (
    <EmptyState
      icon={icon}
      title={title}
      description={description ?? common.emptyHint}
      action={action}
    />
  );
}
