import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="container-page flex flex-col gap-8 py-6 sm:py-10"
    >
      <Skeleton className="h-4 w-56" />
      <div className="flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-3/4" />
        <Skeleton className="h-6 w-11/12" />
        <div className="mt-2 flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </div>
      </div>
      <Skeleton className="aspect-[16/9] rounded-panel lg:aspect-[21/9]" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex max-w-3xl flex-col gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3">
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
        <Skeleton className="hidden h-56 rounded-card lg:block" />
      </div>
    </div>
  );
}
