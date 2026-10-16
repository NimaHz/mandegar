import type { Locale } from "@/i18n/config";
import type { DownloadKind } from "@/types/catalog";

export type ProductSectionId =
  "overview" | "specs" | "features" | "installation" | "downloads" | "warranty" | "faq";

export interface ProductContent {
  sectionNav: string;
  sections: Record<ProductSectionId, string>;
  gallery: {
    label: string;
    thumbnails: string;
    image: string;
    open: string;
    close: string;
    previous: string;
    next: string;
    zoomIn: string;
    zoomOut: string;
    counter: string;
  };
  header: {
    partner: string;
    own: string;
    newBadge: string;
    energy: string;
    releaseYear: string;
    keyFacts: string;
    model: string;
    share: string;
    shareTitle: string;
    copyLink: string;
    catalog: string;
    warranty: string;
    checkCode: string;
    requestService: string;
  };
  overview: { eyebrow: string; title: string };
  specs: { eyebrow: string; title: string; description: string; label: string };
  features: { eyebrow: string; title: string };
  installation: {
    eyebrow: string;
    title: string;
    description: string;
    steps: string;
    step: string;
    tools: string;
    safety: string;
    fullGuide: string;
    minutes: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyGuides: string;
    emptyRequest: string;
  };
  video: {
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    fullscreen: string;
    exitFullscreen: string;
    seek: string;
    chapters: string;
    jumpTo: string;
  };
  downloads: {
    eyebrow: string;
    title: string;
    download: string;
    kinds: Record<DownloadKind, string>;
  };
  warranty: {
    eyebrow: string;
    title: string;
    months: string;
    partsMonths: string;
    startRule: string;
    coverage: string;
    exclusions: string;
    howTitle: string;
    how: string[];
    check: string;
    request: string;
  };
  faq: { eyebrow: string; title: string; all: string };
  related: { eyebrow: string; title: string; all: string; carouselLabel: string };
  recent: { eyebrow: string; title: string; clear: string };
}

export const productContent: Record<Locale, ProductContent> = {
  fa: {
    sectionNav: "بخش‌های صفحه محصول",
    sections: {
      overview: "معرفی",
      specs: "مشخصات فنی",
      features: "ویژگی‌ها",
      installation: "راهنمای نصب",
      downloads: "دانلودها",
      warranty: "گارانتی",
      faq: "پرسش‌ها",
    },
    gallery: {
      label: "تصاویر محصول",
      thumbnails: "انتخاب تصویر",
      image: "تصویر {current} از {total}",
      open: "نمایش تمام‌صفحه تصویر",
      close: "بستن",
      previous: "تصویر قبلی",
      next: "تصویر بعدی",
      zoomIn: "بزرگ‌نمایی",
      zoomOut: "کوچک‌نمایی",
      counter: "{current} از {total}",
    },
    header: {
      partner: "برند همکار",
      own: "ساخت ماندگار",
      newBadge: "مدل جدید",
      energy: "رده انرژی {value}",
      releaseYear: "عرضه {year}",
      keyFacts: "مشخصات کلیدی",
      model: "کد مدل",
      share: "اشتراک‌گذاری",
      shareTitle: "{name} | ماندگار",
      copyLink: "لینک صفحه",
      catalog: "دانلود کاتالوگ",
      warranty: "{count} ماه گارانتی رسمی",
      checkCode: "استعلام کد",
      requestService: "درخواست خدمات",
    },
    overview: { eyebrow: "معرفی", title: "درباره این مدل" },
    specs: {
      eyebrow: "مشخصات فنی",
      title: "همه اعداد، شفاف",
      description: "مقادیر بر اساس آزمون‌های کارخانه است و ممکن است با شرایط نصب کمی تغییر کند.",
      label: "مشخصه",
    },
    features: { eyebrow: "ویژگی‌ها", title: "چه چیزی این مدل را متفاوت می‌کند" },
    installation: {
      eyebrow: "راهنمای نصب",
      title: "نصب این مدل، قدم‌به‌قدم",
      description: "قبل از نصب، ویدیو و مراحل را ببین و نکات ایمنی را جدی بگیر.",
      steps: "مراحل نصب",
      step: "مرحله {count}",
      tools: "ابزار لازم",
      safety: "نکات ایمنی",
      fullGuide: "راهنمای کامل نصب",
      minutes: "{count} دقیقه",
      emptyTitle: "راهنمای نصب این مدل به‌زودی منتشر می‌شود",
      emptyDescription:
        "تا آن زمان، راهنماهای مشابه را ببین یا نصب استاندارد را از سرویس‌کار مجاز ماندگار بخواه.",
      emptyGuides: "همه راهنماها",
      emptyRequest: "درخواست نصب",
    },
    video: {
      play: "پخش ویدیو",
      pause: "توقف ویدیو",
      mute: "بی‌صدا",
      unmute: "پخش صدا",
      fullscreen: "تمام‌صفحه",
      exitFullscreen: "خروج از تمام‌صفحه",
      seek: "زمان ویدیو",
      chapters: "بخش‌های ویدیو",
      jumpTo: "رفتن به {title}، {time}",
    },
    downloads: {
      eyebrow: "دانلودها",
      title: "دفترچه، کاتالوگ و مدارک",
      download: "دانلود",
      kinds: {
        manual: "دفترچه راهنما",
        catalog: "کاتالوگ",
        "warranty-card": "کارت گارانتی",
        datasheet: "برگه مشخصات",
      },
    },
    warranty: {
      eyebrow: "گارانتی",
      title: "گارانتی رسمی ماندگار",
      months: "ماه گارانتی",
      partsMonths: "تأمین قطعه تا {count} ماه",
      startRule: "شروع گارانتی",
      coverage: "پوشش گارانتی",
      exclusions: "خارج از پوشش",
      howTitle: "چطور گارانتی را بررسی کنم؟",
      how: [
        "برچسب گارانتی روی بدنه یا کارتن دستگاه را پیدا کن.",
        "کد ۹ رقمی را در صفحه استعلام گارانتی وارد کن.",
        "مدل، سال تولید و وضعیت پوشش را همان لحظه ببین.",
      ],
      check: "استعلام گارانتی",
      request: "درخواست خدمات برای این مدل",
    },
    faq: { eyebrow: "پرسش‌ها", title: "سؤال‌های رایج درباره این مدل", all: "همه پرسش‌ها" },
    related: {
      eyebrow: "مدل‌های مرتبط",
      title: "شاید این‌ها را هم بپسندی",
      all: "همه محصولات",
      carouselLabel: "مدل‌های مرتبط",
    },
    recent: { eyebrow: "بازدیدهای اخیر", title: "مدل‌هایی که دیده‌ای", clear: "پاک کردن" },
  },
  en: {
    sectionNav: "Product page sections",
    sections: {
      overview: "Overview",
      specs: "Specifications",
      features: "Features",
      installation: "Installation",
      downloads: "Downloads",
      warranty: "Warranty",
      faq: "FAQ",
    },
    gallery: {
      label: "Product images",
      thumbnails: "Choose an image",
      image: "Image {current} of {total}",
      open: "Open image full screen",
      close: "Close",
      previous: "Previous image",
      next: "Next image",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      counter: "{current} of {total}",
    },
    header: {
      partner: "Partner brand",
      own: "Made by Mandegar",
      newBadge: "New model",
      energy: "Energy class {value}",
      releaseYear: "Released {year}",
      keyFacts: "Key facts",
      model: "Model code",
      share: "Share",
      shareTitle: "{name} | Mandegar",
      copyLink: "page link",
      catalog: "Download catalog",
      warranty: "{count}-month official warranty",
      checkCode: "Check a code",
      requestService: "Request service",
    },
    overview: { eyebrow: "Overview", title: "About this model" },
    specs: {
      eyebrow: "Specifications",
      title: "Every number, in the open",
      description:
        "Values come from factory tests and may vary slightly with installation conditions.",
      label: "Specification",
    },
    features: { eyebrow: "Features", title: "What sets this model apart" },
    installation: {
      eyebrow: "Installation guide",
      title: "Installing this model, step by step",
      description:
        "Watch the video and read the steps before you install, and take the safety notes seriously.",
      steps: "Installation steps",
      step: "Step {count}",
      tools: "Tools you need",
      safety: "Safety notes",
      fullGuide: "Full installation guide",
      minutes: "{count} min",
      emptyTitle: "The installation guide for this model is coming soon",
      emptyDescription:
        "Meanwhile, browse similar guides or ask an authorized Mandegar technician for a standard installation.",
      emptyGuides: "All guides",
      emptyRequest: "Request installation",
    },
    video: {
      play: "Play video",
      pause: "Pause video",
      mute: "Mute",
      unmute: "Unmute",
      fullscreen: "Full screen",
      exitFullscreen: "Exit full screen",
      seek: "Video position",
      chapters: "Video chapters",
      jumpTo: "Jump to {title}, {time}",
    },
    downloads: {
      eyebrow: "Downloads",
      title: "Manuals, catalogs and documents",
      download: "Download",
      kinds: {
        manual: "User manual",
        catalog: "Catalog",
        "warranty-card": "Warranty card",
        datasheet: "Datasheet",
      },
    },
    warranty: {
      eyebrow: "Warranty",
      title: "Official Mandegar warranty",
      months: "months of warranty",
      partsMonths: "Spare parts for {count} months",
      startRule: "When it starts",
      coverage: "What's covered",
      exclusions: "Not covered",
      howTitle: "How do I check my warranty?",
      how: [
        "Find the warranty label on the appliance body or its box.",
        "Enter the 9-character code on the warranty check page.",
        "See the model, production year and coverage status instantly.",
      ],
      check: "Check warranty",
      request: "Request service for this model",
    },
    faq: { eyebrow: "FAQ", title: "Common questions about this model", all: "All questions" },
    related: {
      eyebrow: "Related models",
      title: "You might also like",
      all: "All products",
      carouselLabel: "Related models",
    },
    recent: { eyebrow: "Recently viewed", title: "Models you've looked at", clear: "Clear" },
  },
};
