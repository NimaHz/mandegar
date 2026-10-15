import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, SkeletonPage } from "@/features/support/components/page-skeletons";
import { loadingLabel } from "@/features/support/components/route-loading";

export default async function Loading() {
  return (
    <SkeletonPage
      label={await loadingLabel()}
      heroChildren={<Skeleton className="h-18 w-full max-w-2xl rounded-panel" />}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <CardGridSkeleton />
      </div>
    </SkeletonPage>
  );
}
