import { ArrowLeft, LayoutGrid, LifeBuoy, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fa";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

const links = [
  { href: routes.products, label: "products", icon: LayoutGrid },
  { href: routes.warranty, label: "warranty", icon: ShieldCheck },
  { href: routes.serviceRequest, label: "serviceRequest", icon: LifeBuoy },
  { href: routes.guides, label: "guides", icon: Wrench },
] as const;

interface QuickLinksProps {
  locale: Locale;
  nav: Dictionary["nav"];
  title: string;
}

export function QuickLinks({ locale, nav, title }: QuickLinksProps) {
  return (
    <nav aria-labelledby="quick-links-title" className="flex w-full flex-col gap-3">
      <h2 id="quick-links-title" className="text-label font-bold text-muted">
        {title}
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={localizePath(locale, href)}
              className="group flex items-center gap-3 card p-4 text-start transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-card"
            >
              <span className="icon-tile size-10 rounded-field">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="flex-1 text-sm font-bold text-ink">{nav[label]}</span>
              <ArrowLeft
                className="size-4 text-muted transition-[translate,color] duration-300 group-hover:-translate-x-0.5 group-hover:text-primary ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
