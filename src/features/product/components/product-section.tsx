import type { ReactNode } from "react";

import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";

interface ProductSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ProductSection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: ProductSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "scroll-mt-32 border-t border-line py-12 first:border-t-0 sm:py-16 lg:scroll-mt-36",
        className,
      )}
    >
      <SectionHeading
        id={`${id}-title`}
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={action}
        className="mb-8"
      />
      {children}
    </section>
  );
}
