import { MessagesSquare } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { FaqList } from "@/features/catalog/components/faq-list";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { Faq } from "@/types/content";

import { homeContent } from "../content";

interface HomeFaqProps {
  faqs: Faq[];
  locale: Locale;
}

export function HomeFaq({ faqs, locale }: HomeFaqProps) {
  const content = homeContent[locale].faq;
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby="home-faq" className="container-page section-y">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-14">
        <div className="flex flex-col items-start gap-6 lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="home-faq"
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizePath(locale, routes.faq)}
              className={buttonVariants({ variant: "dark" })}
            >
              <MessagesSquare className="size-4.5" aria-hidden />
              {content.all}
            </Link>
            <Link
              href={localizePath(locale, routes.contact)}
              className={buttonVariants({ variant: "line" })}
            >
              {content.contact}
            </Link>
          </div>
        </div>
        <FaqList items={faqs} />
      </div>
    </section>
  );
}
