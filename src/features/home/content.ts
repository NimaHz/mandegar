import type { PluralForms } from "@/features/catalog/plural";
import type { Locale } from "@/i18n/config";

export interface HomeContent {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  hero: {
    label: string;
    secondaryCta: string;
    slideIndex: string;
  };
  warranty: {
    title: string;
    description: string;
    label: string;
    placeholder: string;
    submit: string;
    hint: string;
    requestService: string;
    findCenter: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    description: string;
    models: PluralForms;
    all: string;
  };
  products: {
    eyebrow: string;
    title: string;
    description: string;
    tabsLabel: string;
    featured: string;
    newest: string;
    carouselLabel: string;
    all: string;
  };
  promise: {
    eyebrow: string;
    statement: string;
    highlight: string;
    body: string;
    stats: Record<"years" | "models" | "serviceCenters" | "warrantyMonths", string>;
    statsLabel: string;
  };
  why: {
    eyebrow: string;
    title: string;
    description: string;
    badge: string;
    badgeCaption: string;
    items: Record<
      "durability" | "efficiency" | "network" | "parts",
      { title: string; body: string }
    >;
  };
  partners: {
    eyebrow: string;
    title: string;
    description: string;
    marqueeLabel: string;
    own: string;
    models: PluralForms;
    all: string;
  };
  guides: {
    eyebrow: string;
    title: string;
    description: string;
    note: string;
    steps: string;
    minutes: string;
    watch: string;
    all: string;
  };
  journey: {
    eyebrow: string;
    title: string;
    description: string;
    step: string;
    steps: { title: string; body: string }[];
    request: string;
    track: string;
  };
  posts: {
    eyebrow: string;
    title: string;
    description: string;
    all: string;
    minutes: string;
    kinds: Record<"guide" | "news" | "tips", string>;
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    all: string;
    contact: string;
  };
}

export const homeContent: Record<Locale, HomeContent> = {
  fa: {
    metaTitle: "ماندگار | کولر، بخاری، آبگرمکن و لوازم خانگی بادوام",
    metaDescription:
      "لوازم خانگی بادوام ماندگار با مشخصات کامل، راهنمای نصب هر مدل، استعلام آنی گارانتی و شبکه خدمات پس از فروش در سراسر ایران.",
    heading: "{name}، {slogan}",
    hero: {
      label: "معرفی محصولات ماندگار",
      secondaryCta: "همه محصولات",
      slideIndex: "{current} / {total}",
    },
    warranty: {
      title: "استعلام فوری گارانتی",
      description: "کد ۹ رقمی روی برچسب دستگاه را وارد کن تا اصالت و مدت گارانتی را ببینی.",
      label: "کد گارانتی",
      placeholder: "مثلاً W5K-3M9-XTS",
      submit: "استعلام",
      hint: "کد را با یا بدون خط تیره وارد کن",
      requestService: "ثبت درخواست خدمات",
      findCenter: "نزدیک‌ترین نمایندگی",
    },
    categories: {
      eyebrow: "دسته‌بندی‌ها",
      title: "برای هر فصل خانه",
      description: "از خنکای تابستان تا گرمای زمستان؛ دسته موردنظرت را انتخاب کن.",
      models: { one: "{count} مدل", other: "{count} مدل" },
      all: "همه محصولات",
    },
    products: {
      eyebrow: "محصولات",
      title: "مدل‌هایی که خانه‌ها انتخاب می‌کنند",
      description: "پیشنهادهای ماندگار و تازه‌ترین مدل‌ها، با مشخصات کامل و گارانتی رسمی.",
      tabsLabel: "نمایش محصولات",
      featured: "پیشنهاد ماندگار",
      newest: "جدیدترین‌ها",
      carouselLabel: "محصولات",
      all: "مشاهده همه محصولات",
    },
    promise: {
      eyebrow: "قول ماندگار",
      statement: "ساخته می‌شود که بماند،",
      highlight: "پشتیبانی می‌شود تا همیشه",
      body: "هر دستگاه ماندگار با قطعات قابل‌تعمیر طراحی می‌شود و پشتش شبکه‌ای از سرویس‌کاران مجاز در سراسر کشور ایستاده است.",
      stats: {
        years: "سال تجربه ساخت",
        models: "مدل فعال در سبد محصول",
        serviceCenters: "مرکز خدمات و نمایندگی",
        warrantyMonths: "ماه گارانتی رسمی",
      },
      statsLabel: "ماندگار در یک نگاه",
    },
    why: {
      eyebrow: "چرا ماندگار",
      title: "مهندسی‌شده برای سال‌ها کار بی‌دردسر",
      description:
        "ماندگار را برای خانه‌های ایرانی ساخته‌ایم؛ برای برق نوسانی، آب سخت و تابستان‌های طولانی.",
      badge: "تا {count} ماه",
      badgeCaption: "گارانتی رسمی و قطعه اصلی",
      items: {
        durability: {
          title: "دوام در شرایط واقعی",
          body: "بدنه گالوانیزه، موتور مسی و آزمون‌های طول عمر پیش از تولید انبوه.",
        },
        efficiency: {
          title: "مصرف انرژی کمتر",
          body: "رده انرژی روی هر مدل مشخص است؛ کم‌مصرف‌ترین‌ها با یک فیلتر پیدا می‌شوند.",
        },
        network: {
          title: "خدمات در سراسر کشور",
          body: "نمایندگی‌ها و سرویس‌کاران مجاز در استان‌ها، با پیگیری آنلاین هر درخواست.",
        },
        parts: {
          title: "قطعه اصلی و گارانتی رسمی",
          body: "هر دستگاه کد گارانتی دارد و قطعات اصلی تا سال‌ها بعد در دسترس است.",
        },
      },
    },
    partners: {
      eyebrow: "برندها",
      title: "ماندگار و برندهای همکار",
      description:
        "در کنار محصولات خودمان، گزیده‌ای از برندهای همکار را با همان گارانتی و خدمات ماندگار عرضه می‌کنیم.",
      marqueeLabel: "برندهای عرضه‌شده در ماندگار",
      own: "برند ماندگار",
      models: { one: "{count} مدل", other: "{count} مدل" },
      all: "همه برندها",
    },
    guides: {
      eyebrow: "راهنمای نصب",
      title: "نصب درست، از روز اول",
      description:
        "ویدیو و مراحل تصویری نصب، ابزار لازم و نکات ایمنی؛ قبل از تماس با نصاب نگاهی بینداز.",
      note: "راهنمای نصب هر مدل، در صفحه همان مدل هم آمده است.",
      steps: "{count} مرحله",
      minutes: "{count} دقیقه",
      watch: "دیدن راهنما",
      all: "همه راهنماها",
    },
    journey: {
      eyebrow: "خدمات پس از فروش",
      title: "سه قدم تا رسیدگی",
      description:
        "بدون حساب کاربری و بدون صف تلفن؛ درخواستت را ثبت کن و وضعیتش را لحظه‌به‌لحظه ببین.",
      step: "قدم {count}",
      steps: [
        {
          title: "درخواست را ثبت کن",
          body: "نوع مشکل، مدل دستگاه و کد گارانتی را در فرم کوتاه خدمات وارد کن.",
        },
        {
          title: "کد رهگیری بگیر",
          body: "بلافاصله یک کد رهگیری می‌گیری تا وضعیت درخواست را هر زمان ببینی.",
        },
        {
          title: "سرویس‌کار تماس می‌گیرد",
          body: "نزدیک‌ترین سرویس‌کار مجاز برای هماهنگی زمان مراجعه با تو تماس می‌گیرد.",
        },
      ],
      request: "ثبت درخواست خدمات",
      track: "پیگیری درخواست",
    },
    posts: {
      eyebrow: "مجله ماندگار",
      title: "نکته‌هایی برای خانه‌ای راحت‌تر",
      description: "راهنمای خرید، نگهداری و تازه‌ترین خبرهای ماندگار.",
      all: "همه مطالب",
      minutes: "{count} دقیقه مطالعه",
      kinds: { guide: "راهنمای خرید", news: "خبر", tips: "نگهداری" },
    },
    faq: {
      eyebrow: "پرسش‌های متداول",
      title: "پیش از خرید بدان",
      description: "پاسخ رایج‌ترین سؤال‌ها درباره خرید، گارانتی و خدمات ماندگار.",
      all: "همه پرسش‌ها",
      contact: "تماس با ما",
    },
  },
  en: {
    metaTitle: "Mandegar | Durable coolers, heaters and water heaters",
    metaDescription:
      "Durable Mandegar home appliances with full specs, an installation guide for every model, instant warranty checks and after-sales service across Iran.",
    heading: "{name}: {slogan}",
    hero: {
      label: "Mandegar highlights",
      secondaryCta: "All products",
      slideIndex: "{current} / {total}",
    },
    warranty: {
      title: "Instant warranty check",
      description:
        "Enter the 9-character code on your appliance label to see its authenticity and coverage.",
      label: "Warranty code",
      placeholder: "e.g. W5K-3M9-XTS",
      submit: "Check",
      hint: "With or without dashes",
      requestService: "Request service",
      findCenter: "Find a service centre",
    },
    categories: {
      eyebrow: "Categories",
      title: "For every season at home",
      description: "From cool summers to warm winters. Pick a category to start.",
      models: { one: "{count} model", other: "{count} models" },
      all: "All products",
    },
    products: {
      eyebrow: "Products",
      title: "Models homes choose",
      description:
        "Our recommendations and newest models, each with full specs and an official warranty.",
      tabsLabel: "Show products",
      featured: "Recommended",
      newest: "Newest",
      carouselLabel: "Products",
      all: "View all products",
    },
    promise: {
      eyebrow: "The Mandegar promise",
      statement: "Built to last,",
      highlight: "supported for good",
      body: "Every Mandegar appliance is designed to be repaired, and backed by authorized technicians across the country.",
      stats: {
        years: "years of manufacturing",
        models: "active models",
        serviceCenters: "service centres and dealers",
        warrantyMonths: "months of official warranty",
      },
      statsLabel: "Mandegar at a glance",
    },
    why: {
      eyebrow: "Why Mandegar",
      title: "Engineered for years of trouble-free use",
      description: "We build for Iranian homes: unsteady power, hard water and long, hot summers.",
      badge: "Up to {count} months",
      badgeCaption: "official warranty, genuine parts",
      items: {
        durability: {
          title: "Durable in real conditions",
          body: "Galvanized bodies, copper-wound motors and lifetime testing before mass production.",
        },
        efficiency: {
          title: "Lower energy use",
          body: "Every model shows its energy class, and one filter finds the most efficient ones.",
        },
        network: {
          title: "Nationwide service",
          body: "Authorized dealers and technicians across the provinces, with online tracking for every request.",
        },
        parts: {
          title: "Genuine parts, official warranty",
          body: "Every unit carries a warranty code, and genuine parts stay available for years.",
        },
      },
    },
    partners: {
      eyebrow: "Brands",
      title: "Mandegar and partner brands",
      description:
        "Alongside our own products, we offer a curated range from partner brands, with the same Mandegar warranty and service.",
      marqueeLabel: "Brands available at Mandegar",
      own: "Mandegar brand",
      models: { one: "{count} model", other: "{count} models" },
      all: "All brands",
    },
    guides: {
      eyebrow: "Installation guides",
      title: "Installed right from day one",
      description:
        "Video, illustrated steps, the tools you need and safety notes. Take a look before you call an installer.",
      note: "Every model page includes its own installation guide.",
      steps: "{count} steps",
      minutes: "{count} min",
      watch: "Open guide",
      all: "All guides",
    },
    journey: {
      eyebrow: "After-sales service",
      title: "Three steps to a fix",
      description:
        "No account and no phone queue. Submit a request and follow its status in real time.",
      step: "Step {count}",
      steps: [
        {
          title: "Submit a request",
          body: "Tell us the issue, the model and the warranty code in a short service form.",
        },
        {
          title: "Get a tracking code",
          body: "You instantly receive a tracking code to check your request at any time.",
        },
        {
          title: "A technician calls you",
          body: "The nearest authorized technician contacts you to schedule a visit.",
        },
      ],
      request: "Request service",
      track: "Track a request",
    },
    posts: {
      eyebrow: "Mandegar Journal",
      title: "Tips for a more comfortable home",
      description: "Buying guides, care tips and the latest from Mandegar.",
      all: "All articles",
      minutes: "{count} min read",
      kinds: { guide: "Buying guide", news: "News", tips: "Care tips" },
    },
    faq: {
      eyebrow: "FAQ",
      title: "Good to know before you buy",
      description: "Answers to the most common questions about buying, warranty and service.",
      all: "All questions",
      contact: "Contact us",
    },
  },
};
