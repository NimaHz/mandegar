import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonPage } from "@/features/support/components/page-skeletons";
import { loadingLabel } from "@/features/support/components/route-loading";

export default async function Loading() {
  return (
    <SkeletonPage
      label={await loadingLabel()}
      heroChildren={
        <div className="flex w-full max-w-xl flex-col gap-4 panel bg-raised p-5 sm:p-7">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full rounded-field" />
          <Skeleton className="h-13 w-full rounded-field" />
        </div>
      }
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 panel bg-raised p-5 sm:p-7">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-card" />
          <Skeleton className="h-48 w-full rounded-card" />
        </div>
      </div>
    </SkeletonPage>
  );
}
