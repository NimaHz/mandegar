import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { BrandSummary } from "@/types/catalog";

import { aboutContent } from "../content";

interface AboutBrandsProps {
  locale: Locale;
  brands: BrandSummary[];
}

export function AboutBrands({ locale, brands }: AboutBrandsProps) {
  const partners = brands.filter((brand) => !brand.isOwn);
  if (partners.length === 0) return null;
  const content = aboutContent[locale].brands;

  return (
    <section aria-labelledby="about-brands" className="container-page">
      <div className="grid gap-8 border-y border-line py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:py-14">
        <SectionHeading
          id="about-brands"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {partners.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={localizePath(locale, routes.brand(brand.slug))}
                aria-label={fill(content.viewBrand, { name: brand.name })}
                className="group flex h-full items-center gap-3 card p-3 transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-card sm:flex-col sm:items-center sm:gap-4 sm:p-6 sm:text-center"
              >
                <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-field bg-white p-2 ring-1 ring-line sm:size-20">
                  {brand.logo ? (
                    <Image
                      src={brand.logo.src}
                      alt=""
                      width={80}
                      height={80}
                      sizes="80px"
                      className="size-full object-contain"
                    />
                  ) : (
                    <span className="font-display text-xl font-black text-brand-deep">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-display text-base font-black text-ink">
                    {brand.name}
                  </span>
                </span>
                <ArrowLeft
                  className="size-4 shrink-0 text-muted transition-[translate,color] duration-300 group-hover:-translate-x-0.5 group-hover:text-primary sm:hidden ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
