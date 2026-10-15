import { Skeleton } from "@/components/ui/skeleton";

import { adminContent } from "../content";

export function ListSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label={adminContent.common.loading}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="flex flex-col gap-2 lg:flex-row">
        <Skeleton className="h-11 w-full lg:max-w-sm" />
        <Skeleton className="h-11 w-44 max-sm:hidden" />
        <Skeleton className="h-11 w-44 max-sm:hidden" />
      </div>
      <div className="flex flex-col gap-px overflow-hidden card">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-line p-4 last:border-0"
          >
            <Skeleton className="size-12 shrink-0" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full max-sm:hidden" />
            <Skeleton className="h-4 w-24 max-md:hidden" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label={adminContent.common.loading}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-72 rounded-card" />
          <Skeleton className="h-56 rounded-card" />
        </div>
        <div className="flex flex-col gap-4 max-lg:hidden">
          <Skeleton className="h-60 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label={adminContent.common.loading}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-card" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-96 rounded-card" />
        <Skeleton className="h-96 rounded-card max-xl:hidden" />
      </div>
    </div>
  );
}
