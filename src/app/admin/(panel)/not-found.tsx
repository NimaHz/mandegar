import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { adminContent } from "@/features/admin/content";
import { adminRoutes } from "@/lib/routes";

export default function AdminNotFound() {
  const copy = adminContent.notFound;
  return (
    <EmptyState
      icon={SearchX}
      title={copy.title}
      description={copy.description}
      className="mt-10"
      action={
        <Link href={adminRoutes.dashboard} className={buttonVariants({ size: "sm" })}>
          {copy.back}
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
      }
    />
  );
}
