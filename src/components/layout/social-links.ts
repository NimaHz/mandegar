import type { SocialPlatform } from "@/components/icons/social-icon";
import type { Locale } from "@/i18n/config";
import type { SocialLinks } from "@/types/content";

const labels: Record<SocialPlatform, Record<Locale, string>> = {
  aparat: { fa: "آپارات", en: "Aparat" },
  instagram: { fa: "اینستاگرام", en: "Instagram" },
  telegram: { fa: "تلگرام", en: "Telegram" },
  bale: { fa: "بله", en: "Bale" },
  eitaa: { fa: "ایتا", en: "Eitaa" },
  rubika: { fa: "روبیکا", en: "Rubika" },
  linkedin: { fa: "لینکدین", en: "LinkedIn" },
};

const order: SocialPlatform[] = [
  "instagram",
  "aparat",
  "telegram",
  "bale",
  "eitaa",
  "rubika",
  "linkedin",
];

export const socialLinksFor = (links: SocialLinks, locale: Locale) =>
  order.flatMap((platform) => {
    const href = links[platform];
    return href ? [{ platform, href, label: labels[platform][locale] }] : [];
  });
