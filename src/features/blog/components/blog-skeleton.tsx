import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden card">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <div className="mt-2 flex items-center gap-3 border-t border-line pt-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label}>
      <div className="bg-glow">
        <div className="container-page flex flex-col items-center gap-4 pt-8 pb-8 sm:pt-12 sm:pb-10 lg:pt-14">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-[min(24rem,80%)] sm:h-14" />
          <Skeleton className="h-5 w-[min(36rem,92%)]" />
          <Skeleton className="h-5 w-[min(28rem,70%)]" />
        </div>
      </div>
      <div className="container-page flex flex-col gap-6 pb-16">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-11 w-full max-w-md rounded-field" />
          <Skeleton className="h-4 w-16 max-sm:hidden" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col overflow-hidden panel">
            <Skeleton className="aspect-[16/10] rounded-none lg:aspect-auto lg:min-h-80 lg:flex-1" />
            <div className="flex flex-col gap-3 p-6 sm:p-8">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-8 w-11/12" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

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
