import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonPage } from "@/features/support/components/page-skeletons";
import { loadingLabel } from "@/features/support/components/route-loading";

export default async function Loading() {
  return (
    <SkeletonPage label={await loadingLabel()} align="start">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
        <div className="flex flex-col gap-6">
          <Skeleton className="aspect-video w-full rounded-card" />
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-card" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-36 rounded-card" />
          <Skeleton className="h-48 rounded-card" />
        </div>
      </div>
    </SkeletonPage>
  );
}
