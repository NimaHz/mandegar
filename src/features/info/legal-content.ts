import type { Locale } from "@/i18n/config";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
}

export interface LegalDocument {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  notice: string;
  tocLabel: string;
  updatedLabel: string;
  updatedAt: string;
  sections: LegalSection[];
}

const UPDATED_AT = "2026-10-15";

export const termsContent: Record<Locale, LegalDocument> = {
  fa: {
    metaTitle: "قوانین و مقررات",
    metaDescription:
      "شرایط استفاده از وب‌سایت ماندگار؛ اطلاعات محصولات، استعلام گارانتی، درخواست خدمات و استفاده مجاز.",
    eyebrow: "شرایط استفاده",
    title: "قوانین و مقررات",
    description:
      "قواعد ساده‌ای که استفاده از وب‌سایت ماندگار را برای همه روشن و منصفانه نگه می‌دارد.",
    notice:
      "این متن یک الگوی اولیه است و پیش از انتشار باید توسط مشاور حقوقی ماندگار بازبینی و نهایی شود.",
    tocLabel: "فهرست بندها",
    updatedLabel: "آخرین به‌روزرسانی",
    updatedAt: UPDATED_AT,
    sections: [
      {
        id: "acceptance",
        title: "پذیرش شرایط",
        paragraphs: [
          "با استفاده از وب‌سایت ماندگار، این شرایط را می‌پذیری. اگر با بخشی از آن موافق نیستی، لطفاً از سایت استفاده نکن.",
          "این سایت برای معرفی محصولات، استعلام گارانتی و ثبت و پیگیری درخواست‌های خدمات پس از فروش ساخته شده است.",
        ],
      },
      {
        id: "catalog",
        title: "اطلاعات محصولات",
        paragraphs: [
          "این سایت فروشگاه نیست و هیچ خرید یا پرداختی در آن انجام نمی‌شود. خرید از طریق نمایندگی‌های مجاز انجام می‌شود.",
          "مشخصات فنی با دقت منتشر می‌شود، اما ممکن است در تولیدهای بعدی بهبود پیدا کند. تصویرها برای آشنایی‌اند و رنگ یا جزئیات ظاهری ممکن است کمی متفاوت باشد.",
        ],
      },
      {
        id: "warranty",
        title: "استعلام گارانتی",
        paragraphs: [
          "نتیجه استعلام، وضعیت ثبت‌شده کد در سامانه ماندگار را نشان می‌دهد. شرایط کامل پوشش همان است که در کارت گارانتی و صفحه شرایط گارانتی آمده است.",
          "برای جلوگیری از سوءاستفاده، تعداد استعلام‌های ناموفق از هر نشانی اینترنتی محدود است.",
        ],
      },
      {
        id: "service",
        title: "درخواست خدمات",
        paragraphs: [
          "هنگام ثبت درخواست، اطلاعات درست و کامل وارد کن تا سرویس‌کار بتواند با تو هماهنگ شود. کد رهگیری و پیوند پیگیری را نزد خودت نگه دار؛ هر کس آن‌ها را داشته باشد می‌تواند وضعیت درخواست را ببیند.",
          "در صورت احساس بوی گاز، پیش از هر چیز شیر اصلی گاز را ببند، پنجره‌ها را باز کن و با اورژانس گاز ۱۹۴ تماس بگیر. ثبت درخواست در سایت جایگزین تماس اضطراری نیست.",
        ],
      },
      {
        id: "acceptable-use",
        title: "استفاده مجاز",
        paragraphs: ["برای حفظ کیفیت خدمات برای همه، این کارها مجاز نیست:"],
        items: [
          "ارسال پیام یا درخواست تبلیغاتی، تکراری یا خودکار؛",
          "تلاش برای حدس زدن کد گارانتی یا کد رهگیری دیگران؛",
          "دور زدن محدودیت‌های تعداد درخواست یا بررسی امنیتی؛",
          "بارگذاری فایل آلوده یا محتوای غیرقانونی.",
        ],
      },
      {
        id: "intellectual-property",
        title: "مالکیت فکری",
        paragraphs: [
          "نام و نشان ماندگار، متن‌ها، تصویرها، ویدیوها و راهنماهای این سایت متعلق به ماندگار یا دارندگان مجوز آن است. استفاده شخصی و غیرتجاری با ذکر منبع آزاد است.",
        ],
      },
      {
        id: "links",
        title: "پیوند به سایت‌های دیگر",
        paragraphs: [
          "برخی پیوندها، مثل مسیریابی در نشان و بلد یا ویدیوهای آپارات، به سایت‌های دیگر می‌روند. مسئولیت محتوا و سیاست‌های آن سایت‌ها با خودشان است.",
        ],
      },
      {
        id: "liability",
        title: "محدودیت مسئولیت",
        paragraphs: [
          "ماندگار برای در دسترس و درست بودن سایت تلاش می‌کند، اما ممکن است گاهی برای نگهداری یا به دلایل فنی در دسترس نباشد. تعهدهای گارانتی و خدمات بر اساس کارت گارانتی و قوانین حمایت از مصرف‌کننده تعیین می‌شود.",
        ],
      },
      {
        id: "changes",
        title: "تغییر شرایط",
        paragraphs: [
          "این شرایط ممکن است به‌روز شود. تاریخ آخرین به‌روزرسانی پایین همین صفحه درج می‌شود و ادامه استفاده از سایت به معنای پذیرش نسخه تازه است.",
        ],
      },
      {
        id: "law",
        title: "قانون حاکم",
        paragraphs: [
          "این شرایط تابع قوانین جمهوری اسلامی ایران است. اگر اختلافی پیش بیاید، پیش از هر اقدامی از طریق صفحه تماس با ما در میان بگذار تا با گفت‌وگو حل شود.",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Terms of use",
    metaDescription:
      "The terms for using the Mandegar website: product information, warranty lookups, service requests and acceptable use.",
    eyebrow: "Terms of use",
    title: "Terms of use",
    description: "Simple rules that keep the Mandegar website clear and fair for everyone.",
    notice:
      "This is a draft template and must be reviewed and finalized by Mandegar's legal counsel before launch.",
    tocLabel: "Sections",
    updatedLabel: "Last updated",
    updatedAt: UPDATED_AT,
    sections: [
      {
        id: "acceptance",
        title: "Accepting these terms",
        paragraphs: [
          "By using the Mandegar website you accept these terms. If you disagree with any part of them, please don't use the site.",
          "The site exists to present our products, check warranties, and submit and track after-sales service requests.",
        ],
      },
      {
        id: "catalog",
        title: "Product information",
        paragraphs: [
          "This site is not a shop: nothing is bought or paid for here. Purchases are made through authorized dealers.",
          "Specifications are published carefully but may improve in later production runs. Images are illustrative, and colours or cosmetic details may differ slightly.",
        ],
      },
      {
        id: "warranty",
        title: "Warranty lookups",
        paragraphs: [
          "A lookup shows the status recorded for a code in the Mandegar system. Full coverage terms are those on the warranty card and the warranty policy page.",
          "To prevent abuse, the number of failed lookups from each network address is limited.",
        ],
      },
      {
        id: "service",
        title: "Service requests",
        paragraphs: [
          "Enter accurate, complete details so a technician can arrange the visit with you. Keep your tracking code and tracking link private: anyone who has them can see the request status.",
          "If you smell gas, first close the main gas valve, open the windows and call the gas emergency line, 194. A request on this site does not replace an emergency call.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use",
        paragraphs: [
          "To keep the service working well for everyone, the following is not allowed:",
        ],
        items: [
          "sending promotional, repeated or automated messages or requests;",
          "trying to guess other people's warranty codes or tracking codes;",
          "getting around request limits or the security check;",
          "uploading infected files or unlawful content.",
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual property",
        paragraphs: [
          "The Mandegar name and mark, and the text, images, videos and guides on this site belong to Mandegar or its licensors. Personal, non-commercial use with attribution is welcome.",
        ],
      },
      {
        id: "links",
        title: "Links to other sites",
        paragraphs: [
          "Some links, such as directions in Neshan and Balad or videos on Aparat, lead to other sites. Those sites are responsible for their own content and policies.",
        ],
      },
      {
        id: "liability",
        title: "Limitation of liability",
        paragraphs: [
          "Mandegar works to keep the site available and accurate, but it may occasionally be unavailable for maintenance or technical reasons. Warranty and service obligations are set by the warranty card and consumer protection law.",
        ],
      },
      {
        id: "changes",
        title: "Changes to these terms",
        paragraphs: [
          "These terms may be updated. The date of the latest update appears at the bottom of this page, and continuing to use the site means accepting the new version.",
        ],
      },
      {
        id: "law",
        title: "Governing law",
        paragraphs: [
          "These terms are governed by the laws of the Islamic Republic of Iran. If a dispute arises, please raise it with us through the contact page first so we can resolve it together.",
        ],
      },
    ],
  },
};

export const privacyContent: Record<Locale, LegalDocument> = {
  fa: {
    metaTitle: "حریم خصوصی",
    metaDescription:
      "ماندگار چه اطلاعاتی نگه می‌دارد و چرا؛ داده‌های درخواست خدمات و فرم تماس، نشانی اینترنتی هش‌شده، کوکی فقط برای مدیران و بدون ردیاب شخص ثالث.",
    eyebrow: "حریم خصوصی",
    title: "اطلاعاتت نزد ماندگار",
    description:
      "فقط همان اطلاعاتی را نگه می‌داریم که برای پاسخ دادن و خدمات‌رسانی لازم است؛ بدون حساب کاربری، بدون تبلیغات و بدون ردیاب.",
    notice:
      "این متن یک الگوی اولیه است و پیش از انتشار باید توسط مشاور حقوقی ماندگار بازبینی و نهایی شود.",
    tocLabel: "فهرست بندها",
    updatedLabel: "آخرین به‌روزرسانی",
    updatedAt: UPDATED_AT,
    sections: [
      {
        id: "summary",
        title: "به زبان ساده",
        paragraphs: [
          "برای استفاده از سایت لازم نیست حساب کاربری بسازی. ما ابزار تحلیل بازدید، تبلیغات یا ردیاب شخص ثالث نداریم و فونت‌ها و فایل‌های سایت از سرور خود ماندگار در ایران بارگذاری می‌شوند.",
        ],
      },
      {
        id: "service-requests",
        title: "درخواست خدمات",
        paragraphs: ["وقتی درخواست خدمات ثبت می‌کنی، این اطلاعات را نگه می‌داریم:"],
        items: [
          "نام، شماره موبایل و در صورت تمایل ایمیل؛",
          "استان، شهر و نشانی محل مراجعه سرویس‌کار؛",
          "کد گارانتی، محصول، تاریخ خرید و شرح مشکل؛",
          "تا ۵ پیوست؛ تصویرها دوباره ذخیره می‌شوند و اطلاعات همراهشان (مثل مکان عکس) حذف می‌شود؛",
          "پیام‌هایی که بین تو و کارشناسان ما رد و بدل می‌شود.",
        ],
      },
      {
        id: "tracking",
        title: "کد رهگیری و پیوند پیگیری",
        paragraphs: [
          "پیوند پیگیری یک رمز تصادفی دارد که فقط شکل هش‌شده آن را ذخیره می‌کنیم. در صفحه پیگیری، شماره موبایل به‌صورت پوشیده (مثل ۰۹۱۲***۴۵۶۷) نمایش داده می‌شود و نشانی نشان داده نمی‌شود.",
        ],
      },
      {
        id: "contact-form",
        title: "فرم تماس",
        paragraphs: [
          "پیام‌های فرم تماس شامل واحد انتخاب‌شده، نام، شماره موبایل، ایمیل (اختیاری)، موضوع و متن پیام است و فقط برای پاسخ به همان پیام استفاده می‌شود.",
        ],
      },
      {
        id: "security",
        title: "حفاظت در برابر سوءاستفاده",
        paragraphs: [
          "برای محدود کردن درخواست‌های مکرر و هرزنامه، نشانی اینترنتی (IP) تو را پیش از ذخیره با یک کلید مخفی هش می‌کنیم و خود نشانی را نگه نمی‌داریم.",
          "بررسی امنیتی فرم‌ها یک معمای محاسباتی است که مرورگرت بی‌صدا حل می‌کند و روی سرور خود ماندگار اجرا می‌شود؛ هیچ سرویس بیرونی مثل reCAPTCHA در کار نیست.",
        ],
      },
      {
        id: "cookies",
        title: "کوکی‌ها",
        paragraphs: [
          "بازدیدکنندگان سایت هیچ کوکی‌ای دریافت نمی‌کنند. تنها کوکی سایت، کوکی نشست امن کارکنان ماندگار برای ورود به بخش مدیریت است.",
        ],
      },
      {
        id: "local-storage",
        title: "ذخیره‌سازی روی دستگاه خودت",
        paragraphs: [
          "این موارد فقط در حافظه مرورگر خودت ذخیره می‌شوند و به سرور ما فرستاده نمی‌شوند:",
        ],
        items: [
          "حالت نمایش روشن یا تیره؛",
          "فهرست مدل‌هایی که برای مقایسه انتخاب کرده‌ای؛",
          "مدل‌هایی که اخیراً دیده‌ای؛",
          "نسخه ذخیره‌شده صفحه‌ها برای استفاده بدون اینترنت.",
        ],
      },
      {
        id: "third-parties",
        title: "سرویس‌های بیرونی",
        paragraphs: [
          "پیوندهای مسیریابی نشان و بلد فقط وقتی رویشان بزنی باز می‌شوند. ویدیوی برخی راهنماهای نصب از آپارات پخش می‌شود و سیاست حریم خصوصی آپارات بر آن حاکم است. اگر ارسال پیامک فعال باشد، کد رهگیری از طریق یک سرویس پیامک داخلی برایت فرستاده می‌شود.",
        ],
      },
      {
        id: "access",
        title: "چه کسانی به اطلاعات دسترسی دارند",
        paragraphs: [
          "فقط کارکنان مجاز ماندگار، بر اساس نقش کاری‌شان، به درخواست‌ها و پیام‌ها دسترسی دارند و همه تغییرات مدیریتی ثبت می‌شود. اطلاعاتت را نمی‌فروشیم و برای تبلیغات در اختیار کسی نمی‌گذاریم.",
          "مدت نگهداری هر نوع داده پیش از انتشار توسط واحد حقوقی تعیین و همین‌جا اعلام می‌شود.",
        ],
      },
      {
        id: "rights",
        title: "حق‌های تو",
        paragraphs: [
          "می‌توانی درخواست کنی اطلاعاتت را ببینی، اصلاح کنی یا حذف کنیم. کافی است از صفحه تماس با ما، واحد «عمومی» را انتخاب کنی و درخواستت را بنویسی.",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Privacy",
    metaDescription:
      "What Mandegar stores and why: service request and contact form data, hashed IP addresses, cookies only for staff, and no third-party trackers.",
    eyebrow: "Privacy",
    title: "Your data at Mandegar",
    description:
      "We keep only what we need to answer you and provide service: no accounts, no ads and no trackers.",
    notice:
      "This is a draft template and must be reviewed and finalized by Mandegar's legal counsel before launch.",
    tocLabel: "Sections",
    updatedLabel: "Last updated",
    updatedAt: UPDATED_AT,
    sections: [
      {
        id: "summary",
        title: "In plain words",
        paragraphs: [
          "You don't need an account to use this site. We run no analytics, advertising or third-party trackers, and the site's fonts and files are served from Mandegar's own servers in Iran.",
        ],
      },
      {
        id: "service-requests",
        title: "Service requests",
        paragraphs: ["When you submit a service request, we store:"],
        items: [
          "your name, mobile number and, if you choose, email;",
          "the province, city and address where the technician should visit;",
          "the warranty code, product, purchase date and problem description;",
          "up to 5 attachments; images are re-saved and their embedded metadata (such as photo location) is removed;",
          "the messages exchanged between you and our team.",
        ],
      },
      {
        id: "tracking",
        title: "Tracking codes and links",
        paragraphs: [
          "Your tracking link contains a random secret, and we store only a hashed form of it. On the tracking page your mobile number is masked (for example 0912***4567) and your address is not shown.",
        ],
      },
      {
        id: "contact-form",
        title: "Contact form",
        paragraphs: [
          "Contact form messages contain the department you chose, your name, mobile number, email (optional), subject and message, and are used only to reply to that message.",
        ],
      },
      {
        id: "security",
        title: "Protection against abuse",
        paragraphs: [
          "To limit repeated requests and spam, we hash your IP address with a secret key before storing it; the address itself is never kept.",
          "The security check on forms is a small computational puzzle your browser solves silently, verified on Mandegar's own server. No outside service such as reCAPTCHA is involved.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies",
        paragraphs: [
          "Visitors receive no cookies. The site's only cookie is the secure session cookie Mandegar staff use to sign in to the admin area.",
        ],
      },
      {
        id: "local-storage",
        title: "Storage on your own device",
        paragraphs: ["These are kept only in your browser's storage and never sent to our server:"],
        items: [
          "your light or dark display preference;",
          "the models you picked for comparison;",
          "the models you viewed recently;",
          "saved copies of pages for offline use.",
        ],
      },
      {
        id: "third-parties",
        title: "Outside services",
        paragraphs: [
          "Neshan and Balad directions open only when you click them. Some installation guide videos play from Aparat, under Aparat's own privacy policy. If text messages are enabled, your tracking code is sent through a domestic SMS provider.",
        ],
      },
      {
        id: "access",
        title: "Who can see your data",
        paragraphs: [
          "Only authorized Mandegar staff can access requests and messages, according to their role, and every admin change is logged. We never sell your data or share it for advertising.",
          "Retention periods for each kind of data will be set by the legal team before launch and published here.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        paragraphs: [
          "You can ask to see, correct or delete your data. Choose the “General” department on the contact page and write your request.",
        ],
      },
    ],
  },
};
