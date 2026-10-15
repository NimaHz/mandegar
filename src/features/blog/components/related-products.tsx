import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { PostDetail } from "@/types/content";

import { blogContent } from "../content";
import { stretchedLink } from "./post-card";

interface RelatedProductsProps {
  products: PostDetail["relatedProducts"];
  locale: Locale;
}

export function RelatedProducts({ products, locale }: RelatedProductsProps) {
  if (products.length === 0) return null;
  const content = blogContent[locale];

  return (
    <section aria-labelledby="post-products" className="flex flex-col gap-6">
      <SectionHeading
        id="post-products"
        title={content.relatedProducts}
        description={content.relatedProductsDescription}
      />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.slug} className="min-w-0">
            <article className="group relative isolate flex h-full card-interactive flex-col overflow-hidden card shadow-card">
              <div className="relative aspect-[4/3] overflow-hidden bg-sunken">
                {product.image ? (
                  <Image
                    src={product.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 64rem) 18rem, (min-width: 48rem) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-105"
                  />
                ) : (
                  <Package
                    className="absolute inset-0 m-auto size-10 text-subtle"
                    strokeWidth={1.4}
                    aria-hidden
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <bdi dir="ltr" className="self-start font-code text-xs font-semibold text-primary">
                  {product.modelCode}
                </bdi>
                <h3 className="line-clamp-2 text-sm leading-6 font-extrabold text-ink">
                  <Link
                    href={localizePath(locale, routes.product(product.slug))}
                    aria-label={fill(content.viewProduct, { name: product.name })}
                    className={stretchedLink}
                  >
                    {product.name}
                  </Link>
                </h3>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
