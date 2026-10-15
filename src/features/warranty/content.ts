import type { CodeInputMessages } from "@/components/shared/code-input";
import type { Locale } from "@/i18n/config";
import type { WarrantyCodeStatus } from "@/types/warranty";

interface StatusCopy {
  badge: string;
  title: string;
  body: string;
}

interface LabelStep {
  title: string;
  body: string;
}

export interface WarrantyContent {
  meta: { title: string; description: string; resultTitle: string };
  hero: { eyebrow: string; title: string; description: string };
  form: { submit: string; pending: string; trust: string; scanHint: string };
  code: CodeInputMessages;
  status: Record<WarrantyCodeStatus, StatusCopy>;
  result: {
    heading: string;
    codeLabel: string;
    partner: string;
    model: string;
    category: string;
    productionYear: string;
    brand: string;
    monthsUnit: string;
    monthsLabel: string;
    parts: string;
    startRule: string;
    coverage: string;
    exclusions: string;
    requestService: string;
    findCenter: string;
    installGuide: string;
    genuineTitle: string;
    genuineBody: string;
  };
  notFound: {
    title: string;
    body: string;
    tipsTitle: string;
    tips: string[];
    contact: string;
    support: string;
  };
  rateLimited: { title: string; body: string; support: string };
  label: {
    eyebrow: string;
    title: string;
    description: string;
    steps: LabelStep[];
    diagramLabel: string;
    diagram: {
      heading: string;
      model: string;
      rows: { label: string; value: string }[];
      codeCaption: string;
      scanCaption: string;
    };
  };
  policies: {
    eyebrow: string;
    title: string;
    description: string;
    months: string;
    parts: string;
    startRule: string;
    coverage: string;
    exclusions: string;
  };
  faq: { eyebrow: string; title: string; more: string };
}

export const warrantyCodeMessages: Record<Locale, CodeInputMessages> = {
  fa: {
    label: "کد گارانتی",
    hint: "۹ کاراکتر از برچسب دستگاه؛ خط تیره، حروف کوچک و کیبورد فارسی هم قبول است.",
    placeholder: "W5K-3M9-XTS",
    progress: "{count} از {total}",
    valid: "ساختار کد درست است.",
    issues: {
      empty: "کد گارانتی را از روی برچسب دستگاه وارد کن.",
      length: "کد گارانتی ۹ کاراکتر است؛ یک بار دیگر با برچسب مقایسه‌اش کن.",
      prefix: "کدهای گارانتی ماندگار با حرف W شروع می‌شوند.",
      check:
        "یکی از کاراکترها با بقیه جور درنمی‌آید؛ احتمالاً اشتباه تایپی است. کاراکترهای شبیه هم مثل 8 و B یا 5 و S را دوباره نگاه کن.",
    },
  },
  en: {
    label: "Warranty code",
    hint: "9 characters from the appliance label. Dashes, lowercase and the Persian keyboard are all fine.",
    placeholder: "W5K-3M9-XTS",
    progress: "{count} of {total}",
    valid: "The code format checks out.",
    issues: {
      empty: "Enter the warranty code printed on your appliance's label.",
      length: "Warranty codes are 9 characters long. Compare yours with the label once more.",
      prefix: "Mandegar warranty codes start with the letter W.",
      check:
        "One character doesn't add up, so it's probably a typo. Look closely at look-alikes such as 8 and B, or 5 and S.",
    },
  },
};

export const warrantyContent: Record<Locale, WarrantyContent> = {
  fa: {
    meta: {
      title: "استعلام گارانتی",
      description:
        "با کد ۹ کاراکتری روی برچسب دستگاه، وضعیت، مدت و پوشش گارانتی محصولات ماندگار را در چند ثانیه ببین.",
      resultTitle: "نتیجه استعلام گارانتی",
    },
    hero: {
      eyebrow: "گارانتی رسمی ماندگار",
      title: "استعلام گارانتی",
      description:
        "روی برچسب مشخصات هر دستگاه ماندگار یک کد گارانتی چاپ شده است؛ هر مدل برای هر سال تولید یک کد دارد. کد را وارد کن، یا QR کنار آن را با دوربین گوشی اسکن کن تا مستقیم به همین صفحه بیایی.",
    },
    form: {
      submit: "بررسی گارانتی",
      pending: "در حال بررسی…",
      trust: "رایگان، بدون ثبت‌نام و در چند ثانیه",
      scanHint: "QR روی برچسب، همین صفحه را با کد پرشده باز می‌کند.",
    },
    code: warrantyCodeMessages.fa,
    status: {
      active: {
        badge: "گارانتی فعال",
        title: "این کد معتبر است",
        body: "کد برای مدل زیر ثبت شده و گارانتی آن فعال است. جزئیات پوشش را پایین‌تر می‌بینی.",
      },
      revoked: {
        badge: "کد باطل شده",
        title: "این کد دیگر معتبر نیست",
        body: "اگر دستگاه را به‌تازگی خریده‌ای، فاکتور خرید را نگه دار و درخواست خدمات ثبت کن تا وضعیت را برایت بررسی کنیم.",
      },
      recalled: {
        badge: "فراخوان خدمات",
        title: "این سری تولید در فراخوان خدمات است",
        body: "برای بازدید و سرویس رایگان دستگاه، درخواست خدمات ثبت کن. هزینه‌ای از تو گرفته نمی‌شود.",
      },
    },
    result: {
      heading: "نتیجه استعلام",
      codeLabel: "کد گارانتی",
      partner: "برند همکار",
      model: "مدل",
      category: "دسته",
      productionYear: "سال تولید",
      brand: "برند",
      monthsUnit: "ماه",
      monthsLabel: "گارانتی رسمی",
      parts: "تأمین قطعه تا {count} ماه",
      startRule: "شروع گارانتی",
      coverage: "چه چیزهایی پوشش داده می‌شود",
      exclusions: "چه چیزهایی پوشش داده نمی‌شود",
      requestService: "ثبت درخواست خدمات",
      findCenter: "یافتن مرکز خدمات",
      installGuide: "راهنمای نصب این مدل",
      genuineTitle: "این کد به‌تنهایی اصالت دستگاه را نشان نمی‌دهد",
      genuineBody:
        "کد گارانتی برای هر مدل و سال تولید صادر می‌شود، نه برای تک‌تک دستگاه‌ها. فاکتور خرید و کارت گارانتی را نگه دار؛ برای استفاده از گارانتی همین دو ملاک‌اند.",
    },
    notFound: {
      title: "این کد را پیدا نکردیم",
      body: "نگران نباش؛ بیشتر وقت‌ها فقط یک کاراکتر اشتباه خوانده شده است. این چند نکته را بررسی کن، یا با ما در تماس باش تا کمکت کنیم.",
      tipsTitle: "چند نکته پیش از تلاش دوباره",
      tips: [
        "کد روی برچسب مشخصات فنی است؛ معمولاً پشت یا کنار دستگاه، و روی کارت گارانتی.",
        "کاراکترهای شبیه هم را دوباره نگاه کن، مثل 8 و B، 2 و Z یا 5 و S.",
        "QR کنار کد را اسکن کن تا کد بدون تایپ وارد شود.",
      ],
      contact: "تماس با ما",
      support: "ثبت درخواست خدمات",
    },
    rateLimited: {
      title: "چند دقیقه صبر کن",
      body: "از این اتصال استعلام‌های ناموفق زیادی ثبت شده است. برای امنیت کدها، چند دقیقه دیگر دوباره امتحان کن.",
      support: "راه‌های تماس با پشتیبانی",
    },
    label: {
      eyebrow: "راهنمای برچسب",
      title: "کد گارانتی کجاست؟",
      description:
        "هر دستگاه ماندگار یک برچسب مشخصات فنی دارد. کد گارانتی و QR آن کنار هم روی همین برچسب چاپ شده‌اند.",
      steps: [
        {
          title: "برچسب را پیدا کن",
          body: "کولر: داخل درِ سرویس. بخاری و آبگرمکن: بدنه کناری یا پشتی. لوازم آشپزخانه: زیر یا پشت دستگاه. همین کد روی کارت گارانتی هم هست.",
        },
        {
          title: "QR را اسکن کن",
          body: "دوربین گوشی را روی QR بگیر؛ همین صفحه با کد پرشده باز می‌شود و نتیجه را فوری می‌بینی.",
        },
        {
          title: "یا کد را تایپ کن",
          body: "۹ کاراکتر، با یا بدون خط تیره. اگر کاراکتری اشتباه باشد، پیش از ارسال خبرت می‌کنیم.",
        },
      ],
      diagramLabel: "نمونه برچسب مشخصات فنی که محل کد گارانتی و QR را نشان می‌دهد",
      diagram: {
        heading: "برچسب مشخصات",
        model: "MC-3500",
        rows: [
          { label: "ولتاژ", value: "220–240 V" },
          { label: "توان", value: "250 W" },
          { label: "سال تولید", value: "1405" },
        ],
        codeCaption: "کد گارانتی",
        scanCaption: "اسکن کن",
      },
    },
    policies: {
      eyebrow: "پوشش گارانتی",
      title: "گارانتی ماندگار چه چیزهایی را پوشش می‌دهد؟",
      description:
        "هر مدل یکی از این برنامه‌ها را دارد. نتیجه استعلام نشان می‌دهد کدام برنامه برای دستگاه تو فعال است.",
      months: "ماه گارانتی",
      parts: "تأمین قطعه: {count} ماه",
      startRule: "شروع گارانتی",
      coverage: "پوشش داده می‌شود",
      exclusions: "پوشش داده نمی‌شود",
    },
    faq: {
      eyebrow: "پرسش‌های گارانتی",
      title: "پرسش‌های رایج درباره گارانتی",
      more: "همه پرسش‌ها",
    },
  },
  en: {
    meta: {
      title: "Warranty check",
      description:
        "Check the status, length and coverage of your Mandegar warranty in seconds with the 9-character code on the appliance label.",
      resultTitle: "Warranty check result",
    },
    hero: {
      eyebrow: "Official Mandegar warranty",
      title: "Warranty check",
      description:
        "Every Mandegar appliance carries a warranty code on its rating label, one code per model for each production year. Type it in, or scan the QR code beside it with your phone camera to land here directly.",
    },
    form: {
      submit: "Check warranty",
      pending: "Checking…",
      trust: "Free, no sign-up, done in seconds",
      scanHint: "The QR code on the label opens this page with the code filled in.",
    },
    code: warrantyCodeMessages.en,
    status: {
      active: {
        badge: "Active warranty",
        title: "This code is valid",
        body: "The code is registered to the model below and its warranty is active. You'll find the full cover details further down.",
      },
      revoked: {
        badge: "Code revoked",
        title: "This code is no longer valid",
        body: "If you bought the appliance recently, keep your invoice and send us a service request so we can look into it for you.",
      },
      recalled: {
        badge: "Service recall",
        title: "This production run is part of a service recall",
        body: "Send a service request to book a free inspection and service. There is no charge to you.",
      },
    },
    result: {
      heading: "Check result",
      codeLabel: "Warranty code",
      partner: "Partner brand",
      model: "Model",
      category: "Category",
      productionYear: "Production year",
      brand: "Brand",
      monthsUnit: "months",
      monthsLabel: "Official warranty",
      parts: "Spare parts for {count} months",
      startRule: "When it starts",
      coverage: "What's covered",
      exclusions: "What's not covered",
      requestService: "Request service",
      findCenter: "Find a service centre",
      installGuide: "Installation guide",
      genuineTitle: "A code alone doesn't prove a unit is genuine",
      genuineBody:
        "Warranty codes are issued per model and production year, not per unit. Keep your purchase invoice and warranty card: together they are what your cover relies on.",
    },
    notFound: {
      title: "We couldn't find this code",
      body: "Don't worry: usually a single character was misread. Run through these tips, or get in touch and we'll help.",
      tipsTitle: "Before you try again",
      tips: [
        "The code is on the rating label, usually on the back or side of the appliance, and on the warranty card.",
        "Re-check look-alike characters such as 8 and B, 2 and Z, or 5 and S.",
        "Scan the QR code beside it to fill in the code without typing.",
      ],
      contact: "Contact us",
      support: "Request service",
    },
    rateLimited: {
      title: "Please wait a few minutes",
      body: "There have been a lot of unsuccessful checks from this connection. To keep codes safe, please try again in a few minutes.",
      support: "Ways to reach support",
    },
    label: {
      eyebrow: "Label guide",
      title: "Where is the code?",
      description:
        "Every Mandegar appliance has a rating label. The warranty code and its QR code sit side by side on it.",
      steps: [
        {
          title: "Find the label",
          body: "Coolers: inside the service door. Heaters and water heaters: the side or back panel. Kitchen appliances: underneath or at the back. The same code is on the warranty card.",
        },
        {
          title: "Scan the QR code",
          body: "Point your phone camera at the QR code. This page opens with the code filled in and shows the result straight away.",
        },
        {
          title: "Or type it in",
          body: "9 characters, with or without dashes. If a character looks wrong, we'll tell you before you submit.",
        },
      ],
      diagramLabel: "A sample rating label showing where the warranty code and QR code are",
      diagram: {
        heading: "Rating label",
        model: "MC-3500",
        rows: [
          { label: "Voltage", value: "220–240 V" },
          { label: "Power", value: "250 W" },
          { label: "Made in", value: "2026" },
        ],
        codeCaption: "Warranty code",
        scanCaption: "Scan me",
      },
    },
    policies: {
      eyebrow: "Coverage",
      title: "What the Mandegar warranty covers",
      description:
        "Every model carries one of these plans. Your check result shows which one applies to your appliance.",
      months: "months of warranty",
      parts: "Spare parts: {count} months",
      startRule: "When it starts",
      coverage: "Covered",
      exclusions: "Not covered",
    },
    faq: { eyebrow: "Warranty FAQ", title: "Common warranty questions", more: "All questions" },
  },
};
