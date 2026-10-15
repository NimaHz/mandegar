import { Package, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { EnergyBadge } from "@/features/catalog/components/energy-badge";
import { catalogContent } from "@/features/catalog/content";
import { SpecValue } from "@/features/product/components/spec-tables";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { gregorianToJalaliYear } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { COMPARE_LIMIT } from "@/stores/compare";
import type { ProductDetail } from "@/types/catalog";

import { compareContent } from "../content";
import { type CompareGroup, differs, specGroups } from "../rows";
import { CompareRemoveButton } from "./compare-remove-button";

interface CompareTableProps {
  products: ProductDetail[];
  locale: Locale;
}

const stickyColumn = "sticky start-0 z-10 w-32 border-e border-line bg-surface sm:w-44 lg:w-56";

export function CompareTable({ products, locale }: CompareTableProps) {
  const { page } = compareContent[locale];
  const slugs = products.map((product) => product.slug);
  const empty = <span className="text-muted">{page.empty}</span>;
  const slots = Math.max(0, COMPARE_LIMIT - products.length);

  const overview: CompareGroup = {
    title: page.overview,
    rows: [
      {
        key: "brand",
        label: page.brand,
        cells: products.map((product) => product.brand.name),
        differs: differs(products.map((product) => product.brand.slug)),
      },
      {
        key: "category",
        label: page.category,
        cells: products.map((product) => product.category.name),
        differs: differs(products.map((product) => product.category.slug)),
      },
      {
        key: "energy",
        label: page.energy,
        cells: products.map((product) =>
          product.energyClass ? (
            <EnergyBadge
              key={product.slug}
              value={product.energyClass}
              label={product.energyClass}
            />
          ) : (
            empty
          ),
        ),
        differs: differs(products.map((product) => product.energyClass ?? "")),
      },
      {
        key: "warranty",
        label: page.warranty,
        cells: products.map((product) =>
          fill(catalogContent[locale].card.warranty, {
            count: formatNumber(locale, product.warrantyMonths),
          }),
        ),
        differs: differs(products.map((product) => String(product.warrantyMonths))),
      },
      {
        key: "release",
        label: page.releaseYear,
        cells: products.map((product) =>
          product.releaseYear
            ? formatNumber(
                locale,
                locale === "fa" ? gregorianToJalaliYear(product.releaseYear) : product.releaseYear,
                { useGrouping: false },
              )
            : empty,
        ),
        differs: differs(products.map((product) => String(product.releaseYear ?? ""))),
      },
    ],
  };

  const groups = [
    overview,
    ...specGroups(products, (item) => (item ? <SpecValue item={item} locale={locale} /> : empty), [
      "energyClass",
    ]),
  ];

  return (
    <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:px-0 lg:overflow-visible">
      <table className="w-full min-w-[38rem] table-fixed border-separate border-spacing-0 text-sm">
        <caption className="sr-only">{page.tableCaption}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className={cn(
                stickyColumn,
                "z-30 bg-canvas p-3 text-start align-bottom text-label font-bold text-muted lg:sticky lg:top-18",
              )}
            >
              {page.modelColumn}
            </th>
            {products.map((product) => (
              <th
                key={product.slug}
                scope="col"
                className="z-20 bg-canvas p-2 align-top font-normal sm:p-3 lg:sticky lg:top-18"
              >
                <div className="relative flex flex-col gap-2.5 text-start">
                  <div className="relative aspect-4/3 overflow-hidden rounded-field bg-sunken">
                    {product.image ? (
                      <Image
                        src={product.image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 300px, 40vw"
                        loading="eager"
                        fetchPriority="high"
                        className="object-cover"
                      />
                    ) : (
                      <Package className="absolute inset-0 m-auto size-8 text-subtle" aria-hidden />
                    )}
                  </div>
                  <CompareRemoveButton slug={product.slug} name={product.name} slugs={slugs} />
                  <Link
                    href={localizePath(locale, routes.product(product.slug))}
                    className="line-clamp-2 text-sm leading-snug font-extrabold text-ink hover:text-primary sm:text-base"
                  >
                    {product.name}
                  </Link>
                  <bdi dir="ltr" className="self-start font-code text-xs font-semibold text-muted">
                    {product.modelCode}
                  </bdi>
                </div>
              </th>
            ))}
            {Array.from({ length: slots }, (_, index) => (
              <td key={index} className="bg-canvas p-2 align-top sm:p-3 lg:sticky lg:top-18">
                <Link
                  href={localizePath(locale, routes.products)}
                  className="flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-field border-2 border-dashed border-line-strong p-3 text-center text-xs font-bold text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="size-5" aria-hidden />
                  {page.addMore}
                </Link>
              </td>
            ))}
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.title}>
            <tr>
              <th
                scope="colgroup"
                colSpan={products.length + slots + 1}
                className="bg-canvas px-0 pt-7 pb-2.5 text-start"
              >
                <span className="sticky start-0 inline-block text-base font-extrabold text-ink">
                  {group.title}
                </span>
              </th>
            </tr>
            {group.rows.map((row, index) => (
              <CompareRowView
                key={row.key}
                label={row.label}
                cells={row.cells}
                differs={row.differs}
                first={index === 0}
                last={index === group.rows.length - 1}
                slots={slots}
              />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

interface CompareRowViewProps {
  label: string;
  cells: ReactNode[];
  differs: boolean;
  first: boolean;
  last: boolean;
  slots: number;
}

function CompareRowView({ label, cells, differs, first, last, slots }: CompareRowViewProps) {
  const tone = differs
    ? "group-data-[highlight=true]/compare:bg-primary-soft"
    : "group-data-[highlight=true]/compare:text-muted";

  const edge = cn("border-b border-line", first && "border-t");

  return (
    <tr>
      <th
        scope="row"
        className={cn(
          stickyColumn,
          edge,
          tone,
          "border-s p-3 text-start align-top font-semibold text-body transition-colors sm:px-4",
          first && "rounded-ss-field",
          last && "rounded-es-field",
        )}
      >
        <span className="flex items-start gap-2">
          {differs && (
            <span
              aria-hidden
              className="mt-1.5 hidden size-1.5 shrink-0 rounded-full bg-accent group-data-[highlight=true]/compare:block"
            />
          )}
          {label}
        </span>
      </th>
      {cells.map((cell, index) => (
        <td
          key={index}
          className={cn(
            edge,
            tone,
            "bg-surface p-3 align-top text-ink transition-colors sm:px-4",
            index === cells.length - 1 && slots === 0 && "border-e",
            index === cells.length - 1 && slots === 0 && first && "rounded-se-field",
            index === cells.length - 1 && slots === 0 && last && "rounded-ee-field",
          )}
        >
          {cell}
        </td>
      ))}
      {Array.from({ length: slots }, (_, index) => (
        <td
          key={`slot-${index}`}
          className={cn(
            edge,
            "bg-surface p-3",
            index === slots - 1 && "border-e",
            index === slots - 1 && first && "rounded-se-field",
            index === slots - 1 && last && "rounded-ee-field",
          )}
        />
      ))}
    </tr>
  );
}
