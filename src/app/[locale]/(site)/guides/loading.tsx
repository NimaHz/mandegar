import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, SkeletonPage } from "@/features/support/components/page-skeletons";
import { loadingLabel } from "@/features/support/components/route-loading";

export default async function Loading() {
  return (
    <SkeletonPage
      label={await loadingLabel()}
      heroChildren={
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      }
    >
      <CardGridSkeleton media />
    </SkeletonPage>
  );
}
