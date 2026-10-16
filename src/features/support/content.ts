import type { CodeInputMessages } from "@/components/shared/code-input";
import { warrantyCodeMessages } from "@/features/warranty/content";
import type { Locale } from "@/i18n/config";
import type { TicketStatus, TicketType } from "@/types/support";

import type { RequestStep } from "./constants";
import type { RequestMessages } from "./schemas";

interface Labeled {
  label: string;
  description: string;
}

export interface SupportHubContent {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; description: string };
  cardsTitle: string;
  cards: Record<"request" | "track" | "warranty" | "guides" | "centers" | "faq", Labeled>;
  requestCta: string;
  requestPoints: string[];
  timeline: {
    eyebrow: string;
    title: string;
    description: string;
    sideTitle: string;
  };
  faq: { eyebrow: string; title: string; more: string };
  contact: {
    title: string;
    body: string;
    hours: string;
    gasTitle: string;
    gasBody: string;
  };
}

export interface RequestFlowContent {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; description: string };
  steps: Record<RequestStep, { label: string; title: string; description: string }>;
  progressLabel: string;
  progress: string;
  nav: {
    back: string;
    next: string;
    submit: string;
    submitting: string;
    edit: string;
    startOver: string;
  };
  draftNote: string;
  product: {
    code: CodeInputMessages;
    optional: string;
    matched: string;
    lookingUp: string;
    matchedYear: string;
    lookupMiss: string;
    lookupFailed: string;
    lookupRetry: string;
    lookupRateLimited: string;
    or: string;
    model: string;
    modelPlaceholder: string;
    modelEmpty: string;
    modelClear: string;
    modelHint: string;
    purchaseDate: string;
    purchaseHint: string;
    year: string;
    month: string;
    day: string;
    clearDate: string;
    months: string[];
  };
  details: {
    subject: string;
    subjectPlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
  };
  gas: { title: string; steps: string[]; note: string };
  attachments: {
    label: string;
    drop: string;
    browse: string;
    rules: string;
    hint: string;
    remove: string;
    tooMany: string;
    tooBig: string;
    badType: string;
    count: string;
  };
  contact: {
    name: string;
    phone: string;
    phoneHint: string;
    phonePlaceholder: string;
    email: string;
    province: string;
    provincePlaceholder: string;
    city: string;
    address: string;
    addressPlaceholder: string;
  };
  review: {
    empty: string;
    consent: string;
    privacy: string;
    honeypot: string;
  };
  errors: RequestMessages;
  submitErrors: {
    generic: string;
    expired: string;
    challenge: string;
    rateLimited: string;
    limit: string;
    tooLarge: string;
    fileType: string;
    validation: string;
    altchaPending: string;
  };
  receipt: {
    title: string;
    body: string;
    codeLabel: string;
    linkLabel: string;
    linkHint: string;
    qr: string;
    qrLabel: string;
    urgentTitle: string;
    urgentBody: string;
    nextTitle: string;
    next: string[];
    track: string;
    another: string;
    support: string;
    previous: string;
  };
  aside: {
    title: string;
    points: string[];
    responseTitle: string;
    responseBody: string;
    phoneTitle: string;
  };
}

export interface TrackContent {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; description: string };
  form: {
    code: CodeInputMessages;
    phone: string;
    phoneHint: string;
    phoneError: string;
    submit: string;
    pending: string;
    notFound: string;
    rateLimited: string;
    generic: string;
    privacy: string;
  };
  tokenInvalid: { title: string; body: string };
  tokenFailed: { title: string };
  view: {
    codeLabel: string;
    type: string;
    product: string;
    warrantyCode: string;
    phone: string;
    created: string;
    updated: string;
    none: string;
    refresh: string;
    refreshed: string;
    refreshFailed: string;
    progressLabel: string;
    another: string;
  };
  thread: {
    title: string;
    customer: string;
    staff: string;
    system: string;
    statusChanged: string;
    attachments: string;
  };
  reply: {
    title: string;
    label: string;
    placeholder: string;
    submit: string;
    sending: string;
    sent: string;
    empty: string;
    closed: string;
    rateLimited: string;
    tooLarge: string;
    fileType: string;
    generic: string;
    cannotReply: string;
    closedNote: string;
    newRequest: string;
  };
}

export const ticketTypeCopy: Record<Locale, Record<TicketType, Labeled>> = {
  fa: {
    "warranty-repair": {
      label: "تعمیر در گارانتی",
      description: "دستگاه در دوره گارانتی است و ایراد پیدا کرده.",
    },
    repair: {
      label: "تعمیر خارج از گارانتی",
      description: "گارانتی تمام شده، ولی تعمیر را به سرویس‌کار مجاز می‌سپاری.",
    },
    "spare-parts": {
      label: "قطعه یدکی",
      description: "قطعه اصلی برای مدل خودت لازم داری.",
    },
    technical: {
      label: "پرسش فنی",
      description: "درباره نصب، کار با دستگاه یا نگهداری سؤال داری.",
    },
    complaint: {
      label: "شکایت",
      description: "از محصول، نمایندگی یا خدمات راضی نبودی.",
    },
    suggestion: {
      label: "پیشنهاد",
      description: "ایده‌ای برای بهتر شدن محصولات یا خدمات داری.",
    },
  },
  en: {
    "warranty-repair": {
      label: "Warranty repair",
      description: "Your appliance is under warranty and has developed a fault.",
    },
    repair: {
      label: "Out-of-warranty repair",
      description: "The warranty has ended, but you want an authorized technician.",
    },
    "spare-parts": {
      label: "Spare parts",
      description: "You need a genuine part for your model.",
    },
    technical: {
      label: "Technical question",
      description: "A question about installing, using or maintaining your appliance.",
    },
    complaint: {
      label: "Complaint",
      description: "You weren't happy with a product, a dealer or our service.",
    },
    suggestion: {
      label: "Suggestion",
      description: "You have an idea to make our products or service better.",
    },
  },
};

export const ticketStatusCopy: Record<Locale, Record<TicketStatus, Labeled>> = {
  fa: {
    new: {
      label: "ثبت شد",
      description: "درخواست ثبت می‌شود و کد رهگیری و لینک اختصاصی پیگیری را همان لحظه می‌گیری.",
    },
    "in-review": {
      label: "در حال بررسی",
      description: "کارشناس ما درخواست و گارانتی را بررسی می‌کند و اگر چیزی لازم باشد می‌پرسد.",
    },
    "awaiting-customer": {
      label: "منتظر پاسخ تو",
      description: "سؤالی از تو پرسیده‌ایم؛ از صفحه پیگیری پاسخ بده تا کار ادامه پیدا کند.",
    },
    scheduled: {
      label: "زمان‌بندی شد",
      description: "زمان مراجعه سرویس‌کار یا تحویل دستگاه با تو هماهنگ می‌شود.",
    },
    "in-repair": {
      label: "در حال تعمیر",
      description: "سرویس‌کار مجاز روی دستگاه کار می‌کند.",
    },
    "awaiting-parts": {
      label: "در انتظار قطعه",
      description: "قطعه سفارش داده شده و به‌محض رسیدن، تعمیر ادامه پیدا می‌کند.",
    },
    resolved: {
      label: "انجام شد",
      description: "کار تمام شده است. اگر مشکلی مانده، در همین درخواست پیام بده.",
    },
    closed: {
      label: "بسته شد",
      description: "درخواست بایگانی شد. برای مشکل تازه، درخواست جدید ثبت کن.",
    },
    rejected: {
      label: "رد شد",
      description: "این درخواست در خدمات قابل ارائه نبود؛ دلیلش را در پیام‌ها نوشته‌ایم.",
    },
  },
  en: {
    new: {
      label: "Received",
      description:
        "Your request is logged and you get a tracking code and private link straight away.",
    },
    "in-review": {
      label: "In review",
      description:
        "A specialist checks your request and warranty, and asks if anything is missing.",
    },
    "awaiting-customer": {
      label: "Waiting for you",
      description: "We've asked you something. Reply on the tracking page so we can carry on.",
    },
    scheduled: {
      label: "Scheduled",
      description: "We arrange a technician visit or drop-off time with you.",
    },
    "in-repair": {
      label: "In repair",
      description: "An authorized technician is working on your appliance.",
    },
    "awaiting-parts": {
      label: "Waiting for parts",
      description: "A part is on order, and the repair continues as soon as it arrives.",
    },
    resolved: {
      label: "Resolved",
      description: "The work is done. If anything is still wrong, reply on the same request.",
    },
    closed: {
      label: "Closed",
      description: "The request is archived. For a new problem, send a new request.",
    },
    rejected: {
      label: "Declined",
      description: "This request fell outside the service we can offer; the messages explain why.",
    },
  },
};

const trackingCodeMessages: Record<Locale, CodeInputMessages> = {
  fa: {
    label: "کد رهگیری",
    hint: "۹ کاراکتر که با T شروع می‌شود؛ در رسید درخواست آمده است.",
    placeholder: "T5K-3M9-XTJ",
    progress: "{count} از {total}",
    valid: "ساختار کد درست است.",
    issues: {
      empty: "کد رهگیری را از رسید درخواست وارد کن.",
      length: "کد رهگیری ۹ کاراکتر است؛ با رسید مقایسه‌اش کن.",
      prefix: "کد رهگیری با حرف T شروع می‌شود.",
      check: "یکی از کاراکترها با بقیه جور درنمی‌آید؛ کد را با رسید مقایسه کن.",
    },
  },
  en: {
    label: "Tracking code",
    hint: "9 characters starting with T, shown on your receipt.",
    placeholder: "T5K-3M9-XTJ",
    progress: "{count} of {total}",
    valid: "The code format checks out.",
    issues: {
      empty: "Enter the tracking code from your receipt.",
      length: "Tracking codes are 9 characters long. Compare yours with the receipt.",
      prefix: "Tracking codes start with the letter T.",
      check: "One character doesn't add up. Compare the code with your receipt.",
    },
  },
};

export const supportHubContent: Record<Locale, SupportHubContent> = {
  fa: {
    meta: {
      title: "خدمات پس از فروش",
      description:
        "استعلام گارانتی، ثبت و پیگیری درخواست تعمیر، راهنمای نصب و نمایندگی‌های خدمات ماندگار در سراسر ایران؛ بدون نیاز به ثبت‌نام.",
    },
    hero: {
      eyebrow: "پشتیبانی ماندگار",
      title: "خدمات پس از فروش ماندگار",
      description:
        "از استعلام گارانتی و راهنمای نصب تا ثبت درخواست تعمیر و پیگیری آن؛ همه مسیرهای پشتیبانی یک‌جا و بدون نیاز به ثبت‌نام.",
    },
    cardsTitle: "از کجا شروع کنیم؟",
    cards: {
      request: {
        label: "ثبت درخواست خدمات",
        description:
          "تعمیر در گارانتی یا خارج از آن، قطعه یدکی، پرسش فنی یا شکایت؛ در چند دقیقه ثبت کن و کد رهگیری بگیر.",
      },
      track: {
        label: "پیگیری درخواست",
        description: "وضعیت را با کد رهگیری و موبایل، یا با لینک اختصاصی ببین و پاسخ بده.",
      },
      warranty: {
        label: "استعلام گارانتی",
        description: "با کد روی برچسب، مدت و پوشش گارانتی دستگاهت را ببین.",
      },
      guides: {
        label: "راهنمای نصب",
        description: "ویدیو و مراحل گام‌به‌گام نصب و راه‌اندازی هر مدل.",
      },
      centers: {
        label: "نمایندگی‌ها و مراکز خدمات",
        description: "نزدیک‌ترین مرکز فروش و خدمات را در استان خودت پیدا کن.",
      },
      faq: {
        label: "پرسش‌های متداول",
        description: "پاسخ کوتاه به سؤال‌های رایج درباره خرید، نصب و گارانتی.",
      },
    },
    requestCta: "شروع درخواست",
    requestPoints: ["بدون ثبت‌نام", "پاسخ اولیه ظرف یک روز کاری", "پیگیری با کد رهگیری"],
    timeline: {
      eyebrow: "مسیر یک درخواست",
      title: "خدمات پس از فروش چطور کار می‌کند؟",
      description: "هر درخواست از این مراحل می‌گذرد و در صفحه پیگیری همیشه می‌بینی کجای مسیر هستی.",
      sideTitle: "وضعیت‌هایی که ممکن است در مسیر ببینی",
    },
    faq: { eyebrow: "پرسش‌های پشتیبانی", title: "پیش از ثبت درخواست بدان", more: "همه پرسش‌ها" },
    contact: {
      title: "ترجیح می‌دهی تلفنی صحبت کنی؟",
      body: "کارشناسان پشتیبانی در ساعات کاری پاسخ‌گو هستند.",
      hours: "ساعات پاسخ‌گویی",
      gasTitle: "بوی گاز حس می‌کنی؟",
      gasBody: "همین حالا شیر گاز را ببند، پنجره‌ها را باز کن و از بیرون خانه با ۱۹۴ تماس بگیر.",
    },
  },
  en: {
    meta: {
      title: "After-sales support",
      description:
        "Check your warranty, book and track a repair, find installation guides and Mandegar service centres across Iran, all without an account.",
    },
    hero: {
      eyebrow: "Mandegar support",
      title: "After-sales support",
      description:
        "From warranty checks and installation guides to booking a repair and following it up: every route to help in one place, no account needed.",
    },
    cardsTitle: "Where would you like to start?",
    cards: {
      request: {
        label: "Request service",
        description:
          "Warranty or paid repairs, spare parts, technical questions or complaints. Send it in a few minutes and get a tracking code.",
      },
      track: {
        label: "Track a request",
        description:
          "See the status with your tracking code and mobile, or your private link, and reply.",
      },
      warranty: {
        label: "Warranty check",
        description: "See how long and what your warranty covers using the code on the label.",
      },
      guides: {
        label: "Installation guides",
        description: "Videos and step-by-step instructions for setting up every model.",
      },
      centers: {
        label: "Service centres",
        description: "Find the nearest sales and service centre in your province.",
      },
      faq: {
        label: "FAQ",
        description: "Short answers to common questions about buying, installing and warranty.",
      },
    },
    requestCta: "Start a request",
    requestPoints: ["No account needed", "First reply within one working day", "Track with a code"],
    timeline: {
      eyebrow: "The journey of a request",
      title: "How after-sales works",
      description:
        "Every request moves through these stages, and the tracking page always shows where yours is.",
      sideTitle: "Statuses you may see along the way",
    },
    faq: { eyebrow: "Support FAQ", title: "Good to know before you ask", more: "All questions" },
    contact: {
      title: "Prefer to talk to someone?",
      body: "Our support team picks up during working hours.",
      hours: "Opening hours",
      gasTitle: "Smell gas?",
      gasBody: "Close the gas valve now, open the windows and call 194 from outside.",
    },
  },
};

export const requestFlowContent: Record<Locale, RequestFlowContent> = {
  fa: {
    meta: {
      title: "ثبت درخواست خدمات",
      description:
        "درخواست تعمیر در گارانتی یا خارج از آن، قطعه یدکی، پرسش فنی یا شکایت را در چند دقیقه ثبت کن و با کد رهگیری پیگیری کن.",
    },
    hero: {
      eyebrow: "خدمات پس از فروش",
      title: "ثبت درخواست خدمات",
      description:
        "در پنج قدم کوتاه بگو چه شده؛ کد رهگیری و لینک اختصاصی پیگیری را همان لحظه می‌گیری.",
    },
    steps: {
      type: {
        label: "نوع درخواست",
        title: "چه کمکی لازم داری؟",
        description: "نوع درخواست را انتخاب کن تا مستقیم به کارشناس مربوط برسد.",
      },
      product: {
        label: "محصول",
        title: "درباره کدام دستگاه است؟",
        description:
          "اگر کد گارانتی را داری وارد کن تا مدل خودکار پیدا شود؛ وگرنه مدل را از فهرست انتخاب کن.",
      },
      details: {
        label: "شرح مشکل",
        title: "چه اتفاقی افتاده؟",
        description:
          "هر چه دقیق‌تر بنویسی، سرویس‌کار آماده‌تر می‌آید. عکس ایراد یا فاکتور خرید هم کمک می‌کند.",
      },
      contact: {
        label: "اطلاعات تماس",
        title: "چطور با تو در تماس باشیم؟",
        description:
          "شماره موبایل برای پیگیری لازم است. نشانی فقط برای هماهنگی سرویس استفاده می‌شود و در صفحه پیگیری نمایش داده نمی‌شود.",
      },
      review: {
        label: "بررسی و ارسال",
        title: "همه چیز درست است؟",
        description: "یک بار مرور کن و بفرست؛ کد رهگیری را بلافاصله می‌گیری.",
      },
    },
    progressLabel: "مراحل ثبت درخواست",
    progress: "مرحله {current} از {total}",
    nav: {
      back: "مرحله قبل",
      next: "ادامه",
      submit: "ارسال درخواست",
      submitting: "در حال ارسال…",
      edit: "ویرایش",
      startOver: "شروع از نو",
    },
    draftNote: "پاسخ‌هایت تا ارسال درخواست یا بستن این زبانه، در همین مرورگر نگه داشته می‌شود.",
    product: {
      code: { ...warrantyCodeMessages.fa, label: "کد گارانتی" },
      optional: "اختیاری",
      matched: "مدل پیدا شد",
      lookingUp: "در حال پیدا کردن مدل…",
      matchedYear: "تولید {year}",
      lookupMiss: "این کد را پیدا نکردیم؛ اشکالی ندارد، مدل را از فهرست پایین انتخاب کن.",
      lookupFailed:
        "بررسی کد انجام نشد؛ اتصال را بررسی کن و دوباره امتحان کن، یا مدل را از فهرست پایین انتخاب کن.",
      lookupRetry: "تلاش دوباره",
      lookupRateLimited:
        "استعلام‌های زیادی از این اتصال ثبت شده است؛ چند دقیقه دیگر امتحان کن یا مدل را از فهرست پایین انتخاب کن.",
      or: "یا",
      model: "مدل دستگاه",
      modelPlaceholder: "نام یا کد مدل، مثلاً MC-4500",
      modelEmpty: "مدلی با این نام پیدا نشد.",
      modelClear: "حذف مدل انتخاب‌شده",
      modelHint: "اگر مدل را نمی‌دانی، این بخش را خالی بگذار و در شرح مشکل بنویس.",
      purchaseDate: "تاریخ خرید",
      purchaseHint: "از روی فاکتور؛ برای محاسبه دوره گارانتی کمک می‌کند.",
      year: "سال",
      month: "ماه",
      day: "روز",
      clearDate: "پاک کردن تاریخ",
      months: [
        "فروردین",
        "اردیبهشت",
        "خرداد",
        "تیر",
        "مرداد",
        "شهریور",
        "مهر",
        "آبان",
        "آذر",
        "دی",
        "بهمن",
        "اسفند",
      ],
    },
    details: {
      subject: "موضوع",
      subjectPlaceholder: "مثلاً: پمپ آب کولر کار نمی‌کند",
      description: "شرح مشکل",
      descriptionPlaceholder:
        "از کی شروع شد؟ صدا یا پیغام خاصی می‌بینی؟ قبلاً تعمیر شده؟ هر نکته‌ای کمک می‌کند.",
    },
    gas: {
      title: "بوی گاز حس می‌کنی؟ اول ایمنی.",
      steps: [
        "شیر اصلی گاز را همین حالا ببند.",
        "در و پنجره‌ها را باز کن و کلید برق، فندک یا شعله روشن نکن.",
        "از بیرون خانه با اورژانس گاز ۱۹۴ تماس بگیر.",
      ],
      note: "درخواستت را فوری علامت می‌زنیم، اما در خطر فوری اول با ۱۹۴ تماس بگیر.",
    },
    attachments: {
      label: "پیوست‌ها",
      drop: "عکس یا فایل را اینجا رها کن یا",
      browse: "انتخاب فایل",
      rules: "تا {count} فایل، هر کدام حداکثر {size} مگابایت؛ JPG، PNG، WebP یا PDF",
      hint: "عکس برچسب، محل ایراد یا فاکتور خرید کار ما را سریع‌تر می‌کند.",
      remove: "حذف {name}",
      tooMany: "حداکثر {count} فایل می‌توانی پیوست کنی.",
      tooBig: "حجم «{name}» بیشتر از {size} مگابایت است.",
      badType: "«{name}» پذیرفته نیست؛ فقط عکس JPG، PNG، WebP یا PDF.",
      count: "{count} از {max}",
    },
    contact: {
      name: "نام و نام خانوادگی",
      phone: "شماره موبایل",
      phoneHint: "با ارقام فارسی یا انگلیسی؛ پیگیری درخواست با همین شماره است.",
      phonePlaceholder: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
      email: "ایمیل",
      province: "استان",
      provincePlaceholder: "استان را انتخاب کن",
      city: "شهر",
      address: "نشانی",
      addressPlaceholder: "خیابان، کوچه، پلاک و واحد",
    },
    review: {
      empty: "وارد نشده",
      consent:
        "با ارسال درخواست می‌پذیری اطلاعاتت فقط برای رسیدگی به همین درخواست استفاده شود. جزئیات در {privacy} آمده است.",
      privacy: "سیاست حریم خصوصی",
      honeypot: "این فیلد را خالی بگذار",
    },
    errors: {
      type: "یکی از گزینه‌ها را انتخاب کن.",
      productNeeded: "کد گارانتی را وارد کن یا مدل دستگاه را انتخاب کن.",
      warrantyCode: "کد گارانتی کامل یا درست نیست؛ اصلاحش کن یا خالی بگذار.",
      purchaseDate: "تاریخ خرید کامل نیست یا در آینده است.",
      subject: "موضوع را در چند کلمه بنویس (حداقل ۳ نویسه).",
      subjectLong: "موضوع حداکثر ۱۲۰ نویسه است.",
      description: "کمی بیشتر توضیح بده (حداقل ۱۰ نویسه).",
      descriptionLong: "شرح مشکل حداکثر ۳۰۰۰ نویسه است.",
      name: "نام و نام خانوادگی را کامل بنویس.",
      phone: "یک شماره موبایل ایرانی معتبر وارد کن، مثل ۰۹۱۲۳۴۵۶۷۸۹.",
      email: "ایمیل درست نیست؛ اصلاحش کن یا خالی بگذار.",
      province: "استان را انتخاب کن.",
      city: "نام شهر را بنویس.",
      address: "نشانی را کامل‌تر بنویس تا سرویس‌کار راحت پیدایت کند.",
    },
    submitErrors: {
      generic: "ارسال انجام نشد. اتصال را بررسی کن و دوباره بفرست.",
      expired: "فرم منقضی شد. یک بار دیگر روی ارسال بزن.",
      challenge: "بررسی امنیتی تأیید نشد. چند لحظه صبر کن تا دوباره انجام شود، بعد بفرست.",
      rateLimited: "از این اتصال درخواست‌های زیادی ثبت شده است. کمی بعد دوباره امتحان کن.",
      limit:
        "برای این شماره سه درخواست باز داری. وضعیتشان را در صفحه پیگیری ببین یا منتظر نتیجه بمان.",
      tooLarge: "حجم پیوست‌ها زیاد است؛ یکی را حذف کن یا فایل کوچک‌تری بگذار.",
      fileType: "نوع یکی از پیوست‌ها پذیرفته نیست؛ فقط عکس یا PDF.",
      validation: "چند مورد نیاز به اصلاح دارد.",
      altchaPending: "چند لحظه صبر کن تا بررسی امنیتی تمام شود.",
    },
    receipt: {
      title: "درخواستت ثبت شد",
      body: "کد رهگیری و لینک زیر را نگه دار؛ با آن‌ها وضعیت را می‌بینی و به پیام‌های کارشناس پاسخ می‌دهی.",
      codeLabel: "کد رهگیری",
      linkLabel: "لینک اختصاصی پیگیری",
      linkHint:
        "این لینک فقط همین یک بار نمایش داده می‌شود و بدون شماره موبایل باز می‌شود؛ ذخیره‌اش کن و با کسی به اشتراک نگذار.",
      qr: "با اسکن این QR، صفحه پیگیری روی گوشی باز می‌شود.",
      qrLabel: "QR لینک اختصاصی پیگیری",
      urgentTitle: "درخواستت فوری علامت خورد",
      urgentBody:
        "اگر هنوز بوی گاز حس می‌کنی، شیر گاز را ببند، پنجره‌ها را باز کن و از بیرون خانه با ۱۹۴ تماس بگیر.",
      nextTitle: "بعد چه می‌شود؟",
      next: [
        "کارشناس ما ظرف یک روز کاری درخواست را بررسی می‌کند و در صورت نیاز تماس می‌گیرد.",
        "وضعیت در صفحه پیگیری به‌روز می‌شود؛ هر وقت خواستی سر بزن.",
        "اگر سؤالی بپرسیم، از همان صفحه پاسخ بده.",
      ],
      track: "مشاهده وضعیت درخواست",
      another: "ثبت درخواست دیگر",
      support: "بازگشت به پشتیبانی",
      previous: "درخواست قبلی‌ات با کد {code} ثبت شده است؛ این فرم برای یک درخواست تازه است.",
    },
    aside: {
      title: "پیش از شروع",
      points: [
        "کد گارانتی روی برچسب مشخصات دستگاه است.",
        "عکس ایراد یا فاکتور خرید را دم دست داشته باش.",
        "ثبت‌نام لازم نیست؛ با کد رهگیری پیگیری می‌کنی.",
      ],
      responseTitle: "پاسخ اولیه ظرف یک روز کاری",
      responseBody: "درخواست‌های فوری مثل بوی گاز زودتر از همه بررسی می‌شوند.",
      phoneTitle: "یا تلفنی تماس بگیر",
    },
  },
  en: {
    meta: {
      title: "Request service",
      description:
        "Book a warranty or paid repair, order spare parts, ask a technical question or raise a complaint in minutes, then follow it with a tracking code.",
    },
    hero: {
      eyebrow: "After-sales support",
      title: "Request service",
      description:
        "Tell us what happened in five short steps. You'll get a tracking code and a private tracking link straight away.",
    },
    steps: {
      type: {
        label: "Type",
        title: "What do you need help with?",
        description: "Pick the request type so it goes straight to the right specialist.",
      },
      product: {
        label: "Product",
        title: "Which appliance is it about?",
        description:
          "Enter the warranty code if you have it and we'll find the model. Otherwise, choose the model from the list.",
      },
      details: {
        label: "Details",
        title: "What's happening?",
        description:
          "The more detail you give, the better prepared our technician will be. A photo of the fault or your invoice helps too.",
      },
      contact: {
        label: "Contact",
        title: "How can we reach you?",
        description:
          "We need your mobile number for tracking. Your address is used only to arrange a visit and is never shown on the tracking page.",
      },
      review: {
        label: "Review",
        title: "Does everything look right?",
        description: "Give it a quick look, then send. You'll get your tracking code right away.",
      },
    },
    progressLabel: "Request steps",
    progress: "Step {current} of {total}",
    nav: {
      back: "Back",
      next: "Continue",
      submit: "Send request",
      submitting: "Sending…",
      edit: "Edit",
      startOver: "Start over",
    },
    draftNote: "Your answers are kept in this browser tab until you send them or close the tab.",
    product: {
      code: { ...warrantyCodeMessages.en, label: "Warranty code" },
      optional: "Optional",
      matched: "Model found",
      lookingUp: "Looking up the model…",
      matchedYear: "Made in {year}",
      lookupMiss:
        "We couldn't match this code. That's fine: choose your model from the list below.",
      lookupFailed:
        "We couldn't check this code. Check your connection and try again, or choose your model from the list below.",
      lookupRetry: "Try again",
      lookupRateLimited:
        "There have been a lot of checks from this connection. Try again in a few minutes, or choose your model from the list below.",
      or: "or",
      model: "Appliance model",
      modelPlaceholder: "Name or model code, e.g. MC-4500",
      modelEmpty: "No model matches that.",
      modelClear: "Clear the selected model",
      modelHint: "Not sure of the model? Leave this empty and mention it in the details.",
      purchaseDate: "Purchase date",
      purchaseHint: "From your invoice. It helps us work out your warranty period.",
      year: "Year",
      month: "Month",
      day: "Day",
      clearDate: "Clear date",
      months: [],
    },
    details: {
      subject: "Subject",
      subjectPlaceholder: "e.g. The cooler's water pump isn't working",
      description: "Description",
      descriptionPlaceholder:
        "When did it start? Any noises or error messages? Has it been repaired before? Every detail helps.",
    },
    gas: {
      title: "Smell gas? Safety first.",
      steps: [
        "Close the main gas valve now.",
        "Open doors and windows, and don't switch on lights, lighters or flames.",
        "Call the gas emergency line 194 from outside.",
      ],
      note: "We'll flag your request as urgent, but in an emergency, call 194 first.",
    },
    attachments: {
      label: "Attachments",
      drop: "Drop photos or files here, or",
      browse: "browse",
      rules: "Up to {count} files, {size} MB each: JPG, PNG, WebP or PDF",
      hint: "A photo of the label, the fault or your invoice speeds things up.",
      remove: "Remove {name}",
      tooMany: "You can attach up to {count} files.",
      tooBig: "“{name}” is larger than {size} MB.",
      badType: "“{name}” isn't supported. Use a JPG, PNG, WebP photo or a PDF.",
      count: "{count} of {max}",
    },
    contact: {
      name: "Full name",
      phone: "Mobile number",
      phoneHint: "An Iranian mobile. You'll use it to track this request.",
      phonePlaceholder: "0912 345 6789",
      email: "Email",
      province: "Province",
      provincePlaceholder: "Choose a province",
      city: "City",
      address: "Address",
      addressPlaceholder: "Street, building number and unit",
    },
    review: {
      empty: "Not provided",
      consent:
        "By sending this request, you agree that we use your details only to handle it. See our {privacy}.",
      privacy: "privacy policy",
      honeypot: "Leave this field empty",
    },
    errors: {
      type: "Choose one of the options.",
      productNeeded: "Enter the warranty code or choose the model.",
      warrantyCode: "The warranty code isn't complete or correct. Fix it or leave it empty.",
      purchaseDate: "The purchase date is incomplete or in the future.",
      subject: "Sum it up in a few words (at least 3 characters).",
      subjectLong: "Keep the subject under 120 characters.",
      description: "Tell us a little more (at least 10 characters).",
      descriptionLong: "The description can be up to 3000 characters.",
      name: "Enter your full name.",
      phone: "Enter a valid Iranian mobile number, such as 0912 345 6789.",
      email: "That email doesn't look right. Fix it or leave it empty.",
      province: "Choose your province.",
      city: "Enter your city.",
      address: "Add a little more to the address so the technician can find you.",
    },
    submitErrors: {
      generic: "We couldn't send your request. Check your connection and try again.",
      expired: "The form timed out. Press send once more.",
      challenge:
        "The security check didn't go through. Wait a moment for it to rerun, then send again.",
      rateLimited: "Too many requests from this connection. Please try again a little later.",
      limit:
        "This number already has three open requests. Check them on the tracking page, or wait for them to wrap up.",
      tooLarge: "The attachments are too large. Remove one or use a smaller file.",
      fileType: "One of the attachments isn't accepted. Use photos or PDFs only.",
      validation: "A few fields need another look.",
      altchaPending: "Give the security check a moment to finish.",
    },
    receipt: {
      title: "Request received",
      body: "Keep the tracking code and link below: they let you follow progress and reply to our specialists.",
      codeLabel: "Tracking code",
      linkLabel: "Private tracking link",
      linkHint:
        "This link is shown only this once and opens without your mobile number. Save it and keep it private.",
      qr: "Scan to open the tracking page on your phone.",
      qrLabel: "QR code for your private tracking link",
      urgentTitle: "Marked as urgent",
      urgentBody:
        "If you can still smell gas, close the valve, open the windows and call 194 from outside.",
      nextTitle: "What happens next",
      next: [
        "A specialist reviews your request within one working day and calls you if needed.",
        "The tracking page updates as things move. Check in any time.",
        "If we ask you something, reply right from that page.",
      ],
      track: "Open tracking page",
      another: "Send another request",
      support: "Back to support",
      previous: "Your previous request {code} is on file. This form starts a new one.",
    },
    aside: {
      title: "Before you start",
      points: [
        "The warranty code is on the appliance's rating label.",
        "Have a photo of the fault or your invoice handy.",
        "No account needed: you'll track it with a code.",
      ],
      responseTitle: "First reply within one working day",
      responseBody: "Urgent requests, such as a gas smell, are looked at first.",
      phoneTitle: "Or give us a call",
    },
  },
};

export const trackContent: Record<Locale, TrackContent> = {
  fa: {
    meta: {
      title: "پیگیری درخواست",
      description:
        "وضعیت درخواست خدمات ماندگار را با کد رهگیری و شماره موبایل یا لینک اختصاصی ببین و به پیام‌ها پاسخ بده.",
    },
    hero: {
      eyebrow: "خدمات پس از فروش",
      title: "پیگیری درخواست",
      description:
        "کد رهگیری و شماره موبایلی را که با آن درخواست دادی وارد کن، یا لینک اختصاصی پیگیری را باز کن.",
    },
    form: {
      code: trackingCodeMessages.fa,
      phone: "شماره موبایل",
      phoneHint: "همان شماره‌ای که در درخواست وارد کردی.",
      phoneError: "یک شماره موبایل ایرانی معتبر وارد کن، مثل ۰۹۱۲۳۴۵۶۷۸۹.",
      submit: "نمایش وضعیت",
      pending: "در حال جستجو…",
      notFound: "درخواستی با این کد و شماره پیدا نکردیم. هر دو را دوباره بررسی کن.",
      rateLimited: "تلاش‌های ناموفق زیاد شد؛ چند دقیقه دیگر دوباره امتحان کن.",
      generic: "الان نتوانستیم وضعیت را بگیریم. اتصال را بررسی کن و دوباره امتحان کن.",
      privacy: "برای حفظ حریم خصوصی، نشانی و شماره کامل تو در این صفحه نمایش داده نمی‌شود.",
    },
    tokenInvalid: {
      title: "این لینک معتبر نیست",
      body: "شاید لینک ناقص کپی شده باشد. با کد رهگیری و شماره موبایل پیگیری کن.",
    },
    tokenFailed: {
      title: "فعلاً نتوانستیم این درخواست را باز کنیم",
    },
    view: {
      codeLabel: "کد رهگیری",
      type: "نوع درخواست",
      product: "محصول",
      warrantyCode: "کد گارانتی",
      phone: "موبایل",
      created: "ثبت",
      updated: "آخرین به‌روزرسانی",
      none: "—",
      refresh: "به‌روزرسانی",
      refreshed: "وضعیت به‌روز شد",
      refreshFailed: "به‌روزرسانی انجام نشد",
      progressLabel: "مراحل رسیدگی",
      another: "پیگیری درخواست دیگر",
    },
    thread: {
      title: "گفتگو",
      customer: "تو",
      staff: "پشتیبانی ماندگار",
      system: "پیام سیستم",
      statusChanged: "وضعیت درخواست به «{status}» تغییر کرد",
      attachments: "پیوست‌ها",
    },
    reply: {
      title: "پاسخ بده",
      label: "پیام تو",
      placeholder: "پاسخ یا توضیح تکمیلی‌ات را بنویس…",
      submit: "ارسال پاسخ",
      sending: "در حال ارسال…",
      sent: "پاسخت ارسال شد",
      empty: "پیامت را بنویس.",
      closed: "این درخواست بسته شده و دیگر پاسخ نمی‌پذیرد.",
      rateLimited: "از این اتصال پاسخ‌های زیادی فرستاده شده است. کمی بعد دوباره امتحان کن.",
      tooLarge: "حجم پیوست‌ها زیاد است؛ یکی را حذف کن یا فایل کوچک‌تری بگذار.",
      fileType: "یکی از پیوست‌ها پذیرفته نشد؛ آن را حذف کن و فقط عکس یا PDF سالم بفرست.",
      generic: "پاسخ ارسال نشد. دوباره امتحان کن.",
      cannotReply:
        "برای پاسخ دادن، این صفحه را از لینک اختصاصی پیگیری که در رسید درخواست گرفتی باز کن.",
      closedNote: "این درخواست بسته شده است. اگر مشکل تازه‌ای داری، درخواست جدید ثبت کن.",
      newRequest: "ثبت درخواست جدید",
    },
  },
  en: {
    meta: {
      title: "Track a request",
      description:
        "See the status of your Mandegar service request with your tracking code and mobile number, or your private link, and reply to messages.",
    },
    hero: {
      eyebrow: "After-sales support",
      title: "Track a request",
      description:
        "Enter your tracking code and the mobile number you used, or open your private tracking link.",
    },
    form: {
      code: trackingCodeMessages.en,
      phone: "Mobile number",
      phoneHint: "The number you gave when you sent the request.",
      phoneError: "Enter a valid Iranian mobile number, such as 0912 345 6789.",
      submit: "Show status",
      pending: "Looking it up…",
      notFound: "We couldn't find a request with that code and number. Check both and try again.",
      rateLimited: "Too many unsuccessful attempts. Please try again in a few minutes.",
      generic: "We couldn't load the status right now. Check your connection and try again.",
      privacy: "For your privacy, your address and full number are never shown on this page.",
    },
    tokenInvalid: {
      title: "This link isn't valid",
      body: "It may have been copied incompletely. Track with your code and mobile number instead.",
    },
    tokenFailed: {
      title: "We couldn't open this request just now",
    },
    view: {
      codeLabel: "Tracking code",
      type: "Request type",
      product: "Product",
      warrantyCode: "Warranty code",
      phone: "Mobile",
      created: "Sent",
      updated: "Last update",
      none: "—",
      refresh: "Refresh",
      refreshed: "Status updated",
      refreshFailed: "Couldn't refresh",
      progressLabel: "Progress",
      another: "Track another request",
    },
    thread: {
      title: "Conversation",
      customer: "You",
      staff: "Mandegar support",
      system: "System message",
      statusChanged: "Status changed to “{status}”",
      attachments: "Attachments",
    },
    reply: {
      title: "Reply",
      label: "Your message",
      placeholder: "Write your reply or any extra details…",
      submit: "Send reply",
      sending: "Sending…",
      sent: "Reply sent",
      empty: "Write your message first.",
      closed: "This request is closed and no longer takes replies.",
      rateLimited: "Too many replies from this connection. Please try again a little later.",
      tooLarge: "The attachments are too large. Remove one or use a smaller file.",
      fileType:
        "One of the attachments wasn't accepted. Remove it and send only intact photos or PDFs.",
      generic: "Your reply wasn't sent. Please try again.",
      cannotReply: "To reply, open this page from the private tracking link on your receipt.",
      closedNote: "This request is closed. If something new comes up, send a new request.",
      newRequest: "Send a new request",
    },
  },
};
