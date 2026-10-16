import type { Locale } from "@/i18n/config";
import type { PluralForms } from "@/i18n/plural";

export type LlmsPageKey =
  | "warranty"
  | "serviceRequest"
  | "track"
  | "serviceCenters"
  | "faq"
  | "support"
  | "about"
  | "contact"
  | "brands"
  | "glossary"
  | "blog";

interface LlmsContent {
  name: string;
  summary: string;
  languages: string;
  fullFacts: string;
  feeds: string;
  sections: { products: string; support: string; guides: string; company: string };
  allProducts: string;
  allGuides: string;
  models: PluralForms;
  warrantyMonths: string;
  pages: Record<LlmsPageKey, { label: string; note: string }>;
  full: {
    title: string;
    catalog: string;
    supportTitle: string;
    url: string;
    modelCode: string;
    category: string;
    brand: string;
    summary: string;
    keyFacts: string;
    specs: string;
    warranty: string;
    guide: string;
    faq: string;
    warrantyCodes: string;
    serviceRequest: string;
    hours: string;
    phones: string;
    emails: string;
    address: string;
    policies: string;
    coverage: string;
    exclusions: string;
    startRule: string;
    centers: string;
  };
}

export const llmsContent: Record<Locale, LlmsContent> = {
  en: {
    name: "Mandegar",
    summary:
      "Mandegar is an Iranian maker of durable home appliances: evaporative coolers, gas and electric heaters, water heaters, kitchen appliances and fans. Every model comes with an official warranty, installation guides and nationwide after-sales service. The website is a catalog: it has no prices, cart or checkout.",
    languages: "Persian is the default language at {fa}. English pages live under {en}.",
    fullFacts: "Full plain-text facts: {url}",
    feeds: "Blog RSS feeds: {fa} (Persian) and {en} (English)",
    sections: {
      products: "Products by category",
      support: "Support and warranty",
      guides: "Guides",
      company: "Company",
    },
    allProducts: "All products",
    allGuides: "All guides",
    models: { one: "{count} model", other: "{count} models" },
    warrantyMonths: "{count}-month warranty",
    pages: {
      warranty: {
        label: "Warranty check",
        note: "Enter the code printed on the product label or warranty card to see the model, production year and warranty coverage.",
      },
      serviceRequest: {
        label: "Request service",
        note: "Book a repair, installation help, spare parts or technical advice; you get a tracking code.",
      },
      track: {
        label: "Track a request",
        note: "Check a service request with its tracking code and phone number.",
      },
      serviceCenters: {
        label: "Dealers and service centres",
        note: "Authorised dealers and service centres with address, phone and opening hours ({count} listed).",
      },
      faq: { label: "FAQ", note: "Answers about products, warranty, installation and service." },
      support: { label: "After-sales service", note: "Every support option in one place." },
      about: { label: "About Mandegar", note: "Company history, factory and values." },
      contact: { label: "Contact", note: "Phone numbers, email addresses, address and hours." },
      brands: {
        label: "Brands",
        note: "Mandegar and the partner brands it distributes and services.",
      },
      glossary: { label: "Glossary", note: "Plain definitions of appliance terms." },
      blog: { label: "Mandegar Journal", note: "News, buying advice and maintenance tips." },
    },
    full: {
      title: "Mandegar: full product and support facts (English)",
      catalog: "Product catalog",
      supportTitle: "Support facts",
      url: "URL",
      modelCode: "Model code",
      category: "Category",
      brand: "Brand",
      summary: "Summary",
      keyFacts: "Key facts",
      specs: "Specifications",
      warranty: "Warranty",
      guide: "Installation guide",
      faq: "Questions and answers",
      warrantyCodes:
        "Warranty codes: every product carries a warranty code printed on the product label and the warranty card, either a 9-character batch code such as W5K-3M9-XTS or a 12-character unit serial such as S5K3-M9XT-J7QY. Enter it at {url} to see the model, production year, warranty months, coverage and exclusions. Letters are not case-sensitive and dashes are optional.",
      serviceRequest:
        "Service requests: fill in the form at {url} with your contact details, address, the warranty code if you have one, and a description. You get a 9-character tracking code such as T5K-3M9-XTJ and a private link. Track the request at {track}. If you smell gas, close the gas valve, open the windows and call 194.",
      hours: "Hours",
      phones: "Phone",
      emails: "Email",
      address: "Address",
      policies: "Warranty policies",
      coverage: "Covered",
      exclusions: "Not covered",
      startRule: "Warranty starts",
      centers: "Dealers and service centres",
    },
  },
  fa: {
    name: "ماندگار",
    summary:
      "ماندگار تولیدکننده ایرانی لوازم خانگی بادوام است: کولر آبی، بخاری گازی و برقی، آبگرمکن، لوازم آشپزخانه و پنکه. هر مدل گارانتی رسمی، راهنمای نصب و خدمات پس از فروش در سراسر کشور دارد. این سایت کاتالوگ محصولات است و قیمت، سبد خرید یا پرداخت آنلاین ندارد.",
    languages: "زبان پیش‌فرض فارسی است ({fa}) و صفحه‌های انگلیسی زیر {en} قرار دارند.",
    fullFacts: "اطلاعات کامل به صورت متن ساده: {url}",
    feeds: "خوراک RSS مجله: {fa} (فارسی) و {en} (انگلیسی)",
    sections: {
      products: "محصولات بر اساس دسته",
      support: "پشتیبانی و گارانتی",
      guides: "راهنماها",
      company: "شرکت",
    },
    allProducts: "همه محصولات",
    allGuides: "همه راهنماها",
    models: { one: "{count} مدل", other: "{count} مدل" },
    warrantyMonths: "گارانتی {count} ماهه",
    pages: {
      warranty: {
        label: "استعلام گارانتی",
        note: "کد چاپ‌شده روی برچسب محصول یا کارت گارانتی را وارد کنید تا مدل، سال تولید و پوشش گارانتی را ببینید.",
      },
      serviceRequest: {
        label: "ثبت درخواست خدمات",
        note: "درخواست تعمیر، کمک در نصب، قطعه یدکی یا مشاوره فنی؛ بعد از ثبت، کد پیگیری می‌گیرید.",
      },
      track: {
        label: "پیگیری درخواست",
        note: "وضعیت درخواست را با کد پیگیری و شماره موبایل ببینید.",
      },
      serviceCenters: {
        label: "نمایندگی‌ها و مراکز خدمات",
        note: "{count} نمایندگی و مرکز خدمات مجاز با نشانی، تلفن و ساعت کاری.",
      },
      faq: {
        label: "پرسش‌های متداول",
        note: "پاسخ پرسش‌های رایج درباره محصولات، گارانتی، نصب و خدمات.",
      },
      support: { label: "خدمات پس از فروش", note: "همه راه‌های پشتیبانی در یک صفحه." },
      about: { label: "درباره ماندگار", note: "تاریخچه، کارخانه و ارزش‌های ماندگار." },
      contact: { label: "تماس با ما", note: "شماره‌ها، ایمیل‌ها، نشانی و ساعت کاری." },
      brands: { label: "برندها", note: "ماندگار و برندهای همکاری که عرضه و پشتیبانی می‌کند." },
      glossary: { label: "واژه‌نامه", note: "تعریف ساده اصطلاحات لوازم خانگی." },
      blog: { label: "مجله ماندگار", note: "خبرها، راهنمای خرید و نکته‌های نگهداری." },
    },
    full: {
      title: "ماندگار: اطلاعات کامل محصولات و پشتیبانی (فارسی)",
      catalog: "کاتالوگ محصولات",
      supportTitle: "اطلاعات پشتیبانی",
      url: "نشانی صفحه",
      modelCode: "کد مدل",
      category: "دسته",
      brand: "برند",
      summary: "خلاصه",
      keyFacts: "ویژگی‌های کلیدی",
      specs: "مشخصات فنی",
      warranty: "گارانتی",
      guide: "راهنمای نصب",
      faq: "پرسش و پاسخ",
      warrantyCodes:
        "کد گارانتی: روی برچسب هر محصول و کارت گارانتی آن یک کد گارانتی چاپ شده است؛ یا کد ۹ نویسه‌ای سری تولید مثل W5K-3M9-XTS یا شماره سریال ۱۲ نویسه‌ای دستگاه مثل S5K3-M9XT-J7QY. این کد را در {url} وارد کنید تا مدل، سال تولید، مدت گارانتی، موارد تحت پوشش و استثناها را ببینید. حروف کوچک و بزرگ فرقی ندارند و خط تیره اختیاری است.",
      serviceRequest:
        "درخواست خدمات: فرم {url} را با مشخصات تماس، نشانی، کد گارانتی (اگر دارید) و شرح مشکل پر کنید. یک کد پیگیری ۹ نویسه‌ای مثل T5K-3M9-XTJ و یک لینک خصوصی دریافت می‌کنید. پیگیری درخواست از {track} انجام می‌شود. اگر بوی گاز حس می‌کنید، شیر گاز را ببندید، پنجره‌ها را باز کنید و با ۱۹۴ تماس بگیرید.",
      hours: "ساعت کاری",
      phones: "تلفن",
      emails: "ایمیل",
      address: "نشانی",
      policies: "شرایط گارانتی",
      coverage: "تحت پوشش",
      exclusions: "خارج از پوشش",
      startRule: "شروع گارانتی",
      centers: "نمایندگی‌ها و مراکز خدمات",
    },
  },
};
