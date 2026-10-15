"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { useCompareStore } from "@/stores/compare";

import { compareContent } from "../content";
import { compareHref } from "../href";

interface CompareRemoveButtonProps {
  slug: string;
  name: string;
  slugs: string[];
}

export function CompareRemoveButton({ slug, name, slugs }: CompareRemoveButtonProps) {
  const locale = useLocale();
  const { page } = compareContent[locale];
  const router = useRouter();
  const remove = useCompareStore((state) => state.remove);
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    remove(slug);
    startTransition(() => {
      router.replace(
        compareHref(
          locale,
          slugs.filter((entry) => entry !== slug),
        ),
        { scroll: false },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-label={fill(page.remove, { name })}
      className={cn(
        "absolute end-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-raised/90 text-ink shadow-card ring-1 ring-line backdrop-blur transition-colors hover:bg-danger hover:text-on-primary",
        isPending && "animate-pulse",
      )}
    >
      <X className="size-4" strokeWidth={2.4} aria-hidden />
    </button>
  );
}
