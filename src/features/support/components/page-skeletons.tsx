import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

interface SkeletonPageProps {
  label: string;
  children?: ReactNode;
  heroChildren?: ReactNode;
  align?: "center" | "start";
}

export function SkeletonPage({
  label,
  children,
  heroChildren,
  align = "center",
}: SkeletonPageProps) {
  return (
    <div role="status" aria-label={label}>
      <div className="bg-glow bg-dots">
        <div
          className={cn(
            "container-page flex flex-col gap-4 pt-8 pb-8 sm:pt-12 sm:pb-10",
            align === "center" ? "items-center" : "items-start",
          )}
        >
          <Skeleton className="mb-3 h-4 w-40 self-start" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-[min(26rem,85%)] sm:h-13" />
          <Skeleton className="h-5 w-[min(36rem,95%)]" />
          <Skeleton className="h-5 w-[min(28rem,80%)]" />
          {heroChildren && <div className="mt-4 flex w-full justify-center">{heroChildren}</div>}
        </div>
      </div>
      <div className="container-page pb-16">{children}</div>
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  media = false,
}: {
  count?: number;
  media?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-4 overflow-hidden card bg-raised">
          {media && <Skeleton className="aspect-video w-full rounded-none" />}
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SupportHubSkeleton({ label }: { label: string }) {
  return (
    <SkeletonPage label={label}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-panel md:col-span-2 lg:col-span-1 lg:row-span-3 lg:h-auto" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-card" />
        ))}
        <Skeleton className="h-24 rounded-card md:col-span-2" />
      </div>
    </SkeletonPage>
  );
}

export function RequestSkeleton({ label }: { label: string }) {
  return (
    <SkeletonPage label={label}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        <div className="flex flex-col gap-7 panel bg-raised p-5 sm:p-8">
          <Skeleton className="h-9 w-full rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-24 rounded-card" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-36 rounded-card" />
        </div>
      </div>
    </SkeletonPage>
  );
}

export function TrackSkeleton({ label }: { label: string }) {
  return (
    <SkeletonPage label={label}>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 panel bg-raised p-5 sm:p-7">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-16 w-full rounded-field" />
        <Skeleton className="h-12 w-full rounded-field" />
        <Skeleton className="h-13 w-full rounded-field" />
      </div>
    </SkeletonPage>
  );
}
