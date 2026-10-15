import { TrackSkeleton } from "@/features/support/components/page-skeletons";
import { loadingLabel } from "@/features/support/components/route-loading";

export default async function Loading() {
  return <TrackSkeleton label={await loadingLabel()} />;
}
