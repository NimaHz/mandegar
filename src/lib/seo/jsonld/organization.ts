import { siteConfig } from "@/config/site";
import { type Locale, localeMeta, locales } from "@/i18n/config";
import { jalaliToGregorianYear } from "@/lib/dates";
import { routes } from "@/lib/routes";
import type { SiteSettings, SocialLinks } from "@/types/content";

import { absoluteUrl, localeUrl } from "../urls";
import { ref, siteIds, websiteId } from "./ids";
import type { JsonLdNode } from "./types";

const LOGO_PATH = "/apple-icon.png";
const LOGO_SIZE = 180;

const SUPPORT = /support|service|repair|after[\s-]?sales?|پشتیبانی|خدمات|تعمیر|پس از فروش/i;
const SALES = /sale|dealer|فروش|نمایندگی/i;

const contactType = (label: string) => {
  if (SUPPORT.test(label)) return "technical support";
  if (SALES.test(label)) return "sales";
  return "customer service";
};

const socialUrls = (socials: SocialLinks) =>
  Object.values(socials).filter((url): url is string => Boolean(url));

const alternateNames = (locale: Locale) =>
  [...new Set([...locales.map((other) => siteConfig.name[other]), siteConfig.latinName])].filter(
    (name) => name !== siteConfig.name[locale],
  );

const logoNode = (): JsonLdNode => ({
  "@type": "ImageObject",
  "@id": siteIds.logo,
  url: absoluteUrl(LOGO_PATH),
  contentUrl: absoluteUrl(LOGO_PATH),
  width: LOGO_SIZE,
  height: LOGO_SIZE,
  caption: siteConfig.latinName,
});

interface OrganizationInput {
  locale: Locale;
  settings: SiteSettings;
  description: string;
}

export const organizationNode = ({
  locale,
  settings,
  description,
}: OrganizationInput): JsonLdNode => {
  const { company } = settings;
  const languages = locales.map((item) => localeMeta[item].hreflang);
  return {
    "@type": "Organization",
    "@id": siteIds.organization,
    name: siteConfig.name[locale],
    alternateName: alternateNames(locale),
    legalName: company.legalName,
    url: localeUrl(locale, routes.home),
    description,
    logo: logoNode(),
    image: ref(siteIds.logo),
    foundingDate: company.foundingYear ? String(jalaliToGregorianYear(company.foundingYear)) : null,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "IR",
    },
    ...(settings.location && {
      location: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressCountry: "IR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: settings.location.lat,
          longitude: settings.location.lng,
        },
      },
    }),
    telephone: settings.phones[0]?.value,
    email: settings.emails[0]?.value,
    contactPoint: [
      ...settings.phones.map((phone) => ({
        "@type": "ContactPoint",
        name: phone.label,
        contactType: contactType(phone.label),
        telephone: phone.value,
        areaServed: "IR",
        availableLanguage: languages,
      })),
      ...settings.emails.map((email) => ({
        "@type": "ContactPoint",
        name: email.label,
        contactType: contactType(email.label),
        email: email.value,
        areaServed: "IR",
        availableLanguage: languages,
      })),
    ],
    identifier: [
      company.nationalId
        ? { "@type": "PropertyValue", propertyID: "IR-NationalID", value: company.nationalId }
        : null,
      company.registrationNo
        ? {
            "@type": "PropertyValue",
            propertyID: "IR-RegistrationNo",
            value: company.registrationNo,
          }
        : null,
    ],
    taxID: company.nationalId,
    sameAs: socialUrls(settings.socials),
    brand: ref(siteIds.brand),
    areaServed: { "@type": "Country", name: "Iran", identifier: "IR" },
  };
};

export const ownBrandNode = (locale: Locale, slogan: string): JsonLdNode => ({
  "@type": "Brand",
  "@id": siteIds.brand,
  name: siteConfig.name[locale],
  alternateName: alternateNames(locale),
  slogan,
  url: localeUrl(locale, routes.home),
  logo: ref(siteIds.logo),
});

export const websiteNode = (locale: Locale, name: string, description: string): JsonLdNode => ({
  "@type": "WebSite",
  "@id": websiteId(locale),
  url: localeUrl(locale, routes.home),
  name,
  alternateName: alternateNames(locale),
  description,
  inLanguage: localeMeta[locale].hreflang,
  publisher: ref(siteIds.organization),
  copyrightHolder: ref(siteIds.organization),
});
