import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface PageHeroProps {
  title: ReactNode;
  eyebrow?: string;
  description?: string;
  breadcrumbs?: ReactNode;
  align?: "center" | "start";
  children?: ReactNode;
}

export function PageHero({
  title,
  eyebrow,
  description,
  breadcrumbs,
  align = "center",
  children,
}: PageHeroProps) {
  const centered = align === "center";

  return (
    <section className="bg-glow bg-dots">
      <div
        className={cn(
          "container-page flex flex-col pt-8 pb-8 sm:pt-12 sm:pb-10 lg:pt-14",
          centered ? "items-center text-center" : "items-start text-start",
        )}
      >
        {breadcrumbs && <div className="mb-6 w-full animate-fade">{breadcrumbs}</div>}
        {eyebrow && <p className="mb-3 animate-rise eyebrow">{eyebrow}</p>}
        <h1 className="max-w-4xl animate-rise font-display text-[1.875rem] leading-[1.35] font-black text-balance text-ink sm:text-[2.5rem] lg:text-[3rem]">
          {title}
        </h1>
        {description && (
          <p
            className="mt-4 max-w-2xl animate-rise text-lead leading-8 text-pretty text-body sm:mt-5 sm:text-lg sm:leading-9"
            style={{ animationDelay: "60ms" }}
          >
            {description}
          </p>
        )}
        {children && (
          <div
            className={cn(
              "mt-7 flex w-full animate-rise",
              centered ? "justify-center" : "justify-start",
            )}
            style={{ animationDelay: "120ms" }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
