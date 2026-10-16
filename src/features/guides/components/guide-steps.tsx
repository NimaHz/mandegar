"use client";

import { Check, Link2 } from "lucide-react";
import Image from "next/image";

import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { blurProps } from "@/lib/image";
import type { GuideStep } from "@/types/content";

import type { GuidesContent } from "../content";
import { useGuideProgress } from "../use-guide-progress";

interface GuideStepsProps {
  slug: string;
  steps: GuideStep[];
  copy: GuidesContent["detail"]["steps"];
}

export function GuideSteps({ slug, steps, copy }: GuideStepsProps) {
  const locale = useLocale();
  const { done, toggle } = useGuideProgress(slug, steps.length);

  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const checked = done.includes(index);
        const anchor = `step-${index + 1}`;
        const number = formatNumber(locale, index + 1);
        const label = fill(copy.label, { count: number });
        return (
          <li
            key={anchor}
            id={anchor}
            className={cn(
              "scroll-mt-28 overflow-hidden card bg-raised transition-[border-color,box-shadow] duration-300",
              checked ? "border-success/50" : "shadow-card",
            )}
          >
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_15rem]">
              <div className="flex flex-col gap-3 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <a
                    href={`#${anchor}`}
                    aria-label={label}
                    className={cn(
                      "group/anchor grid size-10 shrink-0 place-items-center rounded-full font-display text-base font-black transition-colors",
                      checked
                        ? "bg-success text-white dark:text-night"
                        : "bg-primary-soft text-primary",
                    )}
                  >
                    {checked ? (
                      <Check className="size-5" strokeWidth={3} aria-hidden />
                    ) : (
                      <>
                        <span className="group-hover/anchor:hidden">{number}</span>
                        <Link2 className="hidden size-4 group-hover/anchor:block" aria-hidden />
                      </>
                    )}
                  </a>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-caption font-bold text-muted">{label}</span>
                    <h3
                      className={cn(
                        "text-base leading-snug font-extrabold sm:text-lg",
                        checked ? "text-muted line-through decoration-success/60" : "text-ink",
                      )}
                    >
                      {step.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-7 whitespace-pre-line text-body sm:text-lead sm:leading-8">
                  {step.body}
                </p>
                <label className="mt-1 inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full border border-line-strong bg-surface py-1.5 ps-2 pe-4 text-sm font-bold text-ink transition-colors hover:border-success has-checked:border-success has-checked:bg-success-soft has-checked:text-success has-focus-visible:ring-3 has-focus-visible:ring-success/25">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(index)}
                    className="peer sr-only"
                  />
                  <span className="grid size-5 place-items-center rounded-full border-2 border-line-strong text-transparent peer-checked:border-success peer-checked:bg-success peer-checked:text-white dark:peer-checked:text-night">
                    <Check className="size-3" strokeWidth={3.5} aria-hidden />
                  </span>
                  {copy.markDone}
                  <span className="sr-only">: {step.title}</span>
                </label>
              </div>
              {step.image && (
                <div className="relative aspect-[4/3] bg-sunken max-sm:order-first sm:aspect-auto sm:min-h-full">
                  <Image
                    src={step.image.src}
                    {...blurProps(step.image)}
                    alt={step.image.alt}
                    fill
                    sizes="(min-width: 640px) 15rem, 92vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
