import type { VideoPlayerLabels } from "@/components/shared/video-player";
import type { Locale } from "@/i18n/config";

export interface GuidesContent {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; description: string };
  filter: { label: string; all: string; results: string };
  card: { minutes: string; steps: string; view: string; textOnly: string };
  empty: { title: string; description: string; action: string };
  detail: {
    eyebrow: string;
    updated: string;
    video: VideoPlayerLabels;
    tools: string;
    safety: string;
    steps: {
      title: string;
      label: string;
      markDone: string;
      progress: string;
      reset: string;
      completeTitle: string;
      completeBody: string;
    };
    transcript: { title: string; toggle: string; chapters: string };
    products: string;
    help: {
      title: string;
      body: string;
      request: string;
      centers: string;
      call: string;
    };
  };
}

export const guidesContent: Record<Locale, GuidesContent> = {
  fa: {
    meta: {
      title: "راهنمای نصب",
      description:
        "ویدیو و مراحل گام‌به‌گام نصب و راه‌اندازی کولر، بخاری، آبگرمکن و لوازم آشپزخانه ماندگار، همراه با ابزار لازم و نکته‌های ایمنی.",
    },
    hero: {
      eyebrow: "نصب درست، عمر بیشتر",
      title: "راهنمای نصب و راه‌اندازی",
      description:
        "ویدیو و مراحل گام‌به‌گام نصب هر مدل ماندگار، با ابزار لازم و نکته‌های ایمنی. صفحه هر محصول هم راهنمای خودش را دارد.",
    },
    filter: { label: "دسته‌بندی راهنماها", all: "همه", results: "{count} راهنما" },
    card: {
      minutes: "{count} دقیقه",
      steps: "{count} مرحله",
      view: "مشاهده راهنما",
      textOnly: "راهنمای متنی",
    },
    empty: {
      title: "در این دسته راهنمایی نیست",
      description: "دسته دیگری را انتخاب کن یا همه راهنماها را ببین.",
      action: "همه راهنماها",
    },
    detail: {
      eyebrow: "راهنمای نصب",
      updated: "به‌روزرسانی: {date}",
      video: {
        play: "پخش ویدیو",
        pause: "توقف",
        mute: "بی‌صدا",
        unmute: "پخش صدا",
        fullscreen: "تمام‌صفحه",
        exitFullscreen: "خروج از تمام‌صفحه",
        seek: "جابه‌جایی در ویدیو",
        chapters: "بخش‌های ویدیو",
        jumpTo: "رفتن به «{title}» در {time}",
      },
      tools: "ابزار لازم",
      safety: "پیش از شروع، ایمنی",
      steps: {
        title: "مرحله به مرحله",
        label: "مرحله {count}",
        markDone: "انجام شد",
        progress: "{done} از {total} مرحله انجام شد",
        reset: "از نو",
        completeTitle: "همه مراحل انجام شد",
        completeBody:
          "اگر دستگاه هنوز درست کار نمی‌کند، درخواست خدمات ثبت کن تا سرویس‌کار بررسی کند.",
      },
      transcript: {
        title: "متن کامل راهنما",
        toggle: "نمایش متن کامل",
        chapters: "بخش‌های ویدیو",
      },
      products: "مدل‌هایی که از این راهنما استفاده می‌کنند",
      help: {
        title: "هنوز کمک لازم داری؟",
        body: "اگر نصب پیچیده‌تر از انتظارت بود، سرویس‌کار مجاز ماندگار این کار را برایت انجام می‌دهد.",
        request: "ثبت درخواست خدمات",
        centers: "نمایندگی‌های نزدیک",
        call: "تماس با پشتیبانی",
      },
    },
  },
  en: {
    meta: {
      title: "Installation guides",
      description:
        "Step-by-step videos for installing Mandegar coolers, heaters, water heaters and kitchen appliances, with the tools you need and key safety notes.",
    },
    hero: {
      eyebrow: "Install it right, keep it longer",
      title: "Installation guides",
      description:
        "Video and step-by-step instructions for every Mandegar model, with the tools you'll need and the safety notes that matter. Every product page links its own guide too.",
    },
    filter: { label: "Guide categories", all: "All", results: "{count} guides" },
    card: {
      minutes: "{count} min",
      steps: "{count} steps",
      view: "View guide",
      textOnly: "Text guide",
    },
    empty: {
      title: "No guides in this category",
      description: "Pick another category or browse every guide.",
      action: "All guides",
    },
    detail: {
      eyebrow: "Installation guide",
      updated: "Updated {date}",
      video: {
        play: "Play video",
        pause: "Pause",
        mute: "Mute",
        unmute: "Unmute",
        fullscreen: "Full screen",
        exitFullscreen: "Exit full screen",
        seek: "Seek",
        chapters: "Chapters",
        jumpTo: "Jump to “{title}” at {time}",
      },
      tools: "Tools you'll need",
      safety: "Safety first",
      steps: {
        title: "Step by step",
        label: "Step {count}",
        markDone: "Done",
        progress: "{done} of {total} steps done",
        reset: "Reset",
        completeTitle: "All steps done",
        completeBody:
          "If the appliance still isn't working right, send a service request and a technician will take a look.",
      },
      transcript: {
        title: "Full text of this guide",
        toggle: "Show the full text",
        chapters: "Video chapters",
      },
      products: "Models that use this guide",
      help: {
        title: "Still need help?",
        body: "If the installation turns out to be more involved than expected, an authorized Mandegar technician can do it for you.",
        request: "Request service",
        centers: "Nearby service centres",
        call: "Call support",
      },
    },
  },
};
