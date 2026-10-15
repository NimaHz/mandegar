import { BadgeCheck, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LogoMark } from "@/components/brand/logo-mark";
import { SocialIcon } from "@/components/icons/social-icon";
import { footerGroups } from "@/config/navigation";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/paths";
import { currentJalaliYear } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { api } from "@/services";

import { layoutContent } from "../content";
import { socialLinksFor } from "../social-links";
import { BackToTop } from "./back-to-top";
import { FooterAccordion, type FooterLinkGroup } from "./footer-accordion";

const headingClass = "font-display text-base font-bold text-ink";
const linkClass =
  "inline-flex min-h-9 items-center rounded-control px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-sunken hover:text-ink";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [{ nav }, categories, settings] = await Promise.all([
    getDictionary(locale),
    api.catalog.categories(locale),
    api.content.settings(locale),
  ]);
  const { footer, homeLabel } = layoutContent[locale];
  const socials = socialLinksFor(settings.socials, locale);
  const year = locale === "fa" ? currentJalaliYear() : new Date().getFullYear();

  const groups: FooterLinkGroup[] = [
    {
      title: footer.products,
      links: [
        ...categories
          .filter((category) => category.parentSlug === null)
          .map((category) => ({
            href: localizePath(locale, routes.category(category.slug)),
            label: category.name,
          })),
        { href: localizePath(locale, routes.products), label: nav.allProducts },
      ],
    },
    ...footerGroups.map((group) => ({
      title: nav[group.title],
      links: group.links.map((link) => ({
        href: localizePath(locale, link.href),
        label: nav[link.label],
      })),
    })),
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface max-lg:pb-[calc(4.25rem+max(0.75rem,env(safe-area-inset-bottom)))]">
      <LogoMark
        tone="mono"
        className="pointer-events-none absolute -end-24 -bottom-32 size-[26rem] text-primary/[0.04]"
      />
      <div className="relative container-page">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo locale={locale} size="md" homeLabel={homeLabel} />
            <span className="h-6 w-px bg-line-strong max-sm:hidden" aria-hidden />
            <p className="text-sm font-semibold text-primary max-sm:hidden">{footer.tagline}</p>
          </div>
          <BackToTop />
        </div>

        <div className="grid gap-8 border-t border-line py-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.3fr)] lg:py-10">
          <FooterAccordion groups={groups} className="lg:hidden" />
          <div className="hidden grid-cols-3 gap-6 lg:grid">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className={headingClass}>{group.title}</h2>
                <ul className="-ms-3 mt-3 flex flex-col gap-0.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <h2 className={headingClass}>{footer.contactTitle}</h2>
              <ul className="flex flex-col gap-2.5 text-sm text-body">
                {settings.phones.map((phone) => (
                  <li key={phone.value} className="flex items-center gap-2.5">
                    <Phone className="size-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted">{phone.label}</span>
                    <a
                      href={`tel:${phone.value.replace(/\s/g, "")}`}
                      className="font-semibold text-ink hover:text-primary"
                    >
                      <bdi dir="ltr">{phone.value}</bdi>
                    </a>
                  </li>
                ))}
                {settings.emails.map((email) => (
                  <li key={email.value} className="flex items-center gap-2.5">
                    <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                    <a
                      href={`mailto:${email.value}`}
                      className="font-semibold text-ink hover:text-primary"
                    >
                      <bdi dir="ltr">{email.value}</bdi>
                    </a>
                  </li>
                ))}
                {settings.address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <address className="leading-7 not-italic">{settings.address}</address>
                  </li>
                )}
              </ul>
            </div>
            {socials.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className={headingClass}>{footer.socialTitle}</h2>
                <ul className="flex flex-wrap gap-2" aria-label={footer.socialLabel}>
                  {socials.map((social) => (
                    <li key={social.platform}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="group grid size-10 place-items-center rounded-control border border-line bg-raised text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <SocialIcon
                          platform={social.platform}
                          className="size-4.5 transition-transform duration-300 ease-(--ease-out-expo) group-hover:-translate-y-0.5"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 border-t border-line py-6 lg:flex-row lg:justify-between lg:gap-16">
          <p className="max-w-3xl text-center text-xs leading-6 text-muted lg:text-start lg:text-label lg:leading-7">
            {footer.about}
          </p>
          <ul className="flex shrink-0 gap-2" aria-label={footer.trustLabel}>
            {[ShieldCheck, BadgeCheck].map((Icon, index) => (
              <li
                key={footer.trustBadges[index]}
                className="flex size-20 flex-col items-center justify-center gap-1.5 rounded-field border border-line bg-raised p-2 text-center text-2xs leading-4 font-semibold text-muted"
              >
                <Icon className="size-6" strokeWidth={1.5} aria-hidden />
                {footer.trustBadges[index]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative bg-chip">
        <p className="container-page flex min-h-12 flex-col items-center justify-center gap-0.5 py-3 text-xs font-semibold text-ink sm:flex-row sm:gap-4 sm:text-label">
          <span>
            {fill(footer.copyright, { year: formatNumber(locale, year, { useGrouping: false }) })}
          </span>
          <span className="h-4 w-px bg-ink/25 max-sm:hidden" aria-hidden />
          <span>{footer.madeIn}</span>
        </p>
      </div>
    </footer>
  );
}
