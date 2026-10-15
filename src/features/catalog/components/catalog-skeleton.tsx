import { ProductCardSkeleton } from "@/components/shared/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

function FiltersSkeleton() {
  return (
    <div className="hidden flex-col gap-5 panel p-4 lg:flex">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 3 }, (_, group) => (
        <div key={group} className="flex flex-col gap-2.5 border-t border-line pt-4">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 4 }, (_, row) => (
            <Skeleton key={row} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CatalogBodySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="container-page grid grid-cols-1 items-start gap-6 pb-16 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <FiltersSkeleton />
      <div className="flex min-w-0 flex-col gap-5">
        <Skeleton className="h-16 w-full rounded-card" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
          {Array.from({ length: count }, (_, index) => (
            <ProductCardSkeleton key={index} className={cn(index > 1 && "max-sm:hidden")} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CatalogSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label}>
      <div className="bg-glow">
        <div className="container-page flex flex-col items-center gap-4 pt-10 pb-8 sm:pt-14 sm:pb-10">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-[min(30rem,85%)] sm:h-13" />
          <Skeleton className="h-5 w-[min(36rem,90%)]" />
          <Skeleton className="mt-3 h-13 w-full max-w-2xl rounded-field lg:h-14" />
        </div>
      </div>
      <CatalogBodySkeleton />
    </div>
  );
}

export function CategorySkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label}>
      <div className="container-page flex flex-col gap-6 pt-6 pb-10 sm:pt-8">
        <Skeleton className="h-4 w-48" />
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <Skeleton className="size-14 rounded-field" />
            <Skeleton className="h-11 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          <Skeleton className="aspect-16/10 w-full rounded-panel" />
        </div>
      </div>
      <CatalogBodySkeleton />
    </div>
  );
}
