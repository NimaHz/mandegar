import { Logo } from "@/components/brand/logo";
import type { Locale } from "@/i18n/config";
import { api } from "@/services";

import { layoutContent } from "../content";
import { socialLinksFor } from "../social-links";
import { HeaderActions } from "./header-actions";
import { HeaderShell } from "./header-shell";
import { MainNav } from "./main-nav";
import { MenuTrigger } from "./menu-trigger";
import { MobileMenu } from "./mobile-menu";
import { SearchDialog } from "./search-dialog";
import { TopBar } from "./top-bar";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const [categories, settings] = await Promise.all([
    api.catalog.categories(locale),
    api.content.settings(locale),
  ]);
  const topLevel = categories.filter((category) => category.parentSlug === null);
  const { homeLabel } = layoutContent[locale];

  return (
    <>
      <TopBar locale={locale} phone={settings.phones[0]?.value ?? null} hours={settings.hours} />
      <HeaderShell>
        <div className="relative container-page flex h-16 items-center gap-3 lg:h-18 lg:gap-6">
          <MenuTrigger />
          <Logo locale={locale} size="sm" homeLabel={homeLabel} className="sm:hidden" />
          <Logo locale={locale} size="md" homeLabel={homeLabel} className="max-sm:hidden" />
          <div className="hidden min-w-0 flex-1 lg:flex">
            <MainNav
              categories={topLevel.map(({ slug, name, summary, icon, productCount }) => ({
                slug,
                name,
                summary,
                icon,
                productCount,
              }))}
              features={settings.features}
            />
          </div>
          <div className="ms-auto lg:ms-0">
            <HeaderActions />
          </div>
        </div>
      </HeaderShell>
      <MobileMenu
        categories={topLevel.map(({ slug, name, icon }) => ({ slug, name, icon }))}
        socials={socialLinksFor(settings.socials, locale)}
        features={settings.features}
      />
      <SearchDialog />
    </>
  );
}
