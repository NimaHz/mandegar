import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label}>
      <div className="bg-glow">
        <div className="container-page flex flex-col gap-6 pt-6 pb-10 sm:pt-8 lg:pb-14">
          <Skeleton className="h-4 w-56" />
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14">
            <div className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-panel sm:aspect-5/4" />
              <div className="flex gap-2.5">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="size-16 rounded-field sm:size-20" />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-11/12" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-4/5" />
              <div className="grid grid-cols-2 gap-1.5 panel p-1.5 sm:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-18 rounded-[1.375rem]" />
                ))}
              </div>
              <div className="flex gap-2.5">
                <Skeleton className="h-12 w-32 rounded-field" />
                <Skeleton className="size-12 rounded-field" />
              </div>
              <Skeleton className="h-12 w-full rounded-field" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-y border-line">
        <div className="container-page flex gap-2 py-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <div className="container-page grid gap-6 py-12 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    </div>
  );
}
