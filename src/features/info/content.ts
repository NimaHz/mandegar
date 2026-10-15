import type { LucideIcon } from "lucide-react";
import {
  Award,
  Factory,
  FlaskConical,
  Gauge,
  Hourglass,
  Leaf,
  MapPinned,
  PencilRuler,
  Ruler,
  ShieldCheck,
  SunSnow,
  Wrench,
} from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { ContactDepartment } from "@/types/support";

interface IconCopy {
  icon: LucideIcon;
  title: string;
  body: string;
}

interface Milestone {
  year: number;
  title: string;
  body: string;
}

interface QualityBadge {
  icon: LucideIcon;
  mark: string;
  title: string;
  body: string;
}

interface CtaLink {
  department: ContactDepartment;
  title: string;
  body: string;
}

export interface AboutContent {
  metaTitle: string;
  metaDescription: string;
  hero: {
    eyebrow: string;
    titleAccent: string;
    titleRest: string;
    mission: string;
    primaryCta: string;
    secondaryCta: string;
    entryLabel: string;
    word: string;
    pronunciation: string;
    partOfSpeech: string;
    senses: string[];
  };
  story: {
    eyebrow: string;
    title: string;
    placeholder: string;
    paragraphs: string[];
    milestonesLabel: string;
    milestones: Milestone[];
  };
  symbol: {
    eyebrow: string;
    title: string;
    description: string;
    figureLabel: string;
    items: { title: string; body: string }[];
  };
  values: { eyebrow: string; title: string; items: IconCopy[] };
  stats: {
    eyebrow: string;
    title: string;
    description: string;
    labels: Record<"years" | "models" | "serviceCenters" | "warrantyMonths", string>;
  };
  process: { eyebrow: string; title: string; description: string; steps: IconCopy[] };
  quality: {
    eyebrow: string;
    title: string;
    description: string;
    placeholder: string;
    badges: QualityBadge[];
  };
  brands: { eyebrow: string; title: string; description: string; viewBrand: string };
  cta: { eyebrow: string; title: string; description: string; links: CtaLink[] };
  facts: {
    title: string;
    legalName: string;
    foundingYear: string;
    nationalId: string;
    registrationNo: string;
    yearFormat: string;
  };
}

export const aboutContent: Record<Locale, AboutContent> = {
  fa: {
    metaTitle: "درباره ماندگار",
    metaDescription:
      "ماندگار یعنی آنچه می‌ماند. با داستان، ارزش‌ها، روش ساخت و شبکه خدمات ماندگار، سازنده کولر، بخاری و آبگرمکن برای خانه‌های ایرانی آشنا شوید.",
    hero: {
      eyebrow: "درباره ماندگار",
      titleAccent: "ماندگار",
      titleRest: " یعنی آنچه می‌ماند",
      mission:
        "ما لوازم خانگی را برای سال‌ها کار بی‌دردسر می‌سازیم: مشخصات فنی دقیق و قابل‌بررسی، قطعه و سرویس در همه استان‌ها و طراحی‌ای که با گرمای جنوب و سرمای شمال‌غرب کنار می‌آید.",
      primaryCta: "دیدن محصولات",
      secondaryCta: "نزدیک‌ترین نمایندگی",
      entryLabel: "معنای نام ماندگار",
      word: "ماندگار",
      pronunciation: "mân·de·gâr",
      partOfSpeech: "صفت · فارسی",
      senses: [
        "پایدار؛ آنچه با گذشت زمان از میان نمی‌رود.",
        "نام برندی که وسایلش را برای ده‌ها سال کار در خانه‌های ایرانی می‌سازد.",
      ],
    },
    story: {
      eyebrow: "داستان ما",
      title: "از یک کارگاه کوچک تا شبکه‌ای در سراسر ایران",
      placeholder: "متن نمونه؛ تاریخچه واقعی پیش از انتشار جایگزین می‌شود",
      paragraphs: [
        "ماندگار کارش را در کارگاهی کوچک با ساخت کولر آبی شروع کرد؛ با این باور ساده که وسیله‌ای که هر تابستان روشن می‌شود، باید سال‌ها بی‌دردسر کار کند و اگر روزی خراب شد، تعمیرش آسان باشد.",
        "سال‌ها بعد بخاری گازی، آبگرمکن و لوازم آشپزخانه به خط تولید اضافه شد و شبکه سرویس‌کاران ماندگار از چند شهر به همه استان‌ها رسید. امروز هر دستگاه با کد گارانتی یکتا شناخته می‌شود و قطعاتش تا سال‌ها پس از توقف تولید در دسترس است.",
      ],
      milestonesLabel: "نقاط عطف",
      milestones: [
        {
          year: 1372,
          title: "شروع در یک کارگاه",
          body: "اولین کولر آبی ماندگار با بدنه گالوانیزه ساخته شد.",
        },
        {
          year: 1381,
          title: "خط تولید گرمایشی",
          body: "بخاری گازی و آبگرمکن به سبد محصولات اضافه شد.",
        },
        {
          year: 1390,
          title: "خدمات در همه استان‌ها",
          body: "سرویس‌کاران مجاز ماندگار در سراسر کشور مستقر شدند.",
        },
        {
          year: 1398,
          title: "آزمایشگاه دوام",
          body: "هر مدل پیش از عرضه، آزمون عمر چرخه‌ای را می‌گذراند.",
        },
        {
          year: 1404,
          title: "کد گارانتی قابل‌استعلام",
          body: "هر دستگاه با کدی یکتا عرضه می‌شود که وضعیت گارانتی را نشان می‌دهد.",
        },
      ],
    },
    symbol: {
      eyebrow: "نشان ماندگار",
      title: "چهار کاشی، یک چرخش",
      description:
        "نشان ماندگار از چهار کاشی یکسان ساخته شده که گرد یک مرکز می‌چرخند. هیچ حرفی در آن نیست؛ پس روی هر دستگاهی می‌نشیند و با هر نامی معنا دارد.",
      figureLabel: "نشان ماندگار: چهار کاشی گرم و خنک که گرد یک مرکز می‌چرخند",
      items: [
        {
          title: "بادگیر، از بالا",
          body: "بادگیر چهارطرفه از بالا مربعی است که به چهار دریچه تقسیم شده و از هر سو باد می‌گیرد. قرن‌هاست خانه‌های یزد را بی‌برق خنک می‌کند؛ ماندگار یعنی همین.",
        },
        {
          title: "پره‌های در حرکت",
          body: "گوشه‌های گرد هر چهار کاشی به یک سو می‌چرخند؛ مثل پره‌هایی که هوا را در کولر و گرما را در بخاری به جریان می‌اندازند.",
        },
        {
          title: "چهار فصل",
          body: "دو کاشی گرم برای ماه‌های سرد و دو کاشی خنک برای ماه‌های گرم؛ ماندگار در هر فصل کنار خانه است، سال‌به‌سال.",
        },
        {
          title: "چهار سوی ایران",
          body: "چهار سو یعنی همه‌جا؛ از شمال تا جنوب و از شرق تا غرب، سرویس‌کار مجاز و قطعه اصلی نزدیک توست.",
        },
      ],
    },
    values: {
      eyebrow: "ارزش‌های ما",
      title: "چهار قولی که به هر خانه می‌دهیم",
      items: [
        {
          icon: Hourglass,
          title: "دوام، پیش از هر چیز",
          body: "قطعه‌ها را برای سال‌ها کار انتخاب می‌کنیم، نه برای ارزان‌ترین قیمت. هر مدل پیش از عرضه آزمون عمر چرخه‌ای را پشت سر می‌گذارد.",
        },
        {
          icon: Ruler,
          title: "صداقت در مشخصات",
          body: "عددی که در کاتالوگ می‌بینی همان است که در آزمایشگاه اندازه گرفته‌ایم؛ هوادهی، مصرف برق و رده انرژی، بدون اغراق.",
        },
        {
          icon: MapPinned,
          title: "خدمات در همه‌جا",
          body: "از بندرعباس تا تبریز، سرویس‌کار مجاز و قطعه اصلی نزدیک توست و هر درخواست با کد رهگیری پیگیری می‌شود.",
        },
        {
          icon: SunSnow,
          title: "ساخته برای اقلیم ایران",
          body: "کولری که در رطوبت خلیج فارس کم نیاورد و بخاری‌ای که از پس زمستان اردبیل بربیاید؛ طراحی ما از آب‌وهوای همین سرزمین شروع می‌شود.",
        },
      ],
    },
    stats: {
      eyebrow: "ماندگار در عدد",
      title: "عددهایی که پشت حرفمان است",
      description:
        "این عددها از سامانه ماندگار خوانده می‌شود و با هر مدل و نمایندگی تازه به‌روز می‌شود.",
      labels: {
        years: "سال تجربه ساخت",
        models: "مدل در سبد محصولات",
        serviceCenters: "نمایندگی و مرکز خدمات",
        warrantyMonths: "ماه گارانتی رسمی",
      },
    },
    process: {
      eyebrow: "چطور می‌سازیم",
      title: "از طراحی تا خدمات پس از فروش",
      description:
        "هر دستگاه ماندگار چهار ایستگاه را پشت سر می‌گذارد و در آخرین ایستگاه، کار ما تازه شروع می‌شود.",
      steps: [
        {
          icon: PencilRuler,
          title: "طراحی",
          body: "هر مدل از نیاز واقعی خانه‌ها شروع می‌شود: متراژ، اقلیم و برقی که در دسترس است.",
        },
        {
          icon: FlaskConical,
          title: "آزمون",
          body: "نمونه‌ها هفته‌ها در اتاق‌های گرم و سرد، با ولتاژ ناپایدار و آب سخت کار می‌کنند.",
        },
        {
          icon: Factory,
          title: "تولید",
          body: "کنترل کیفیت در هر ایستگاه خط تولید و آزمون نهایی روی تک‌تک دستگاه‌ها.",
        },
        {
          icon: Wrench,
          title: "خدمات پس از فروش",
          body: "کد گارانتی، سرویس‌کار مجاز و قطعه اصلی؛ همراهی ما بعد از خرید ادامه دارد.",
        },
      ],
    },
    quality: {
      eyebrow: "کیفیت و استاندارد",
      title: "گواهی‌هایی که پشت هر مدل است",
      description:
        "محصولات ماندگار مطابق استانداردهای ملی ساخته و آزمون می‌شوند. شماره هر گواهی پس از تأیید نهایی همین‌جا منتشر می‌شود.",
      placeholder: "نمونه؛ نشان‌ها و شماره گواهی‌ها پیش از انتشار جایگزین می‌شوند",
      badges: [
        {
          icon: ShieldCheck,
          mark: "ISIRI",
          title: "نشان استاندارد ملی ایران",
          body: "سازمان ملی استاندارد ایران",
        },
        {
          icon: Leaf,
          mark: "A",
          title: "برچسب رده انرژی",
          body: "رده مصرف هر مدل در صفحه محصول",
        },
        {
          icon: Award,
          mark: "ISO 9001",
          title: "سیستم مدیریت کیفیت",
          body: "فرایندهای طراحی، تولید و خدمات",
        },
        {
          icon: Gauge,
          mark: "GAS",
          title: "تأییدیه وسایل گازسوز",
          body: "برای بخاری و آبگرمکن گازی",
        },
      ],
    },
    brands: {
      eyebrow: "برندهای همکار",
      title: "برندهایی که با گارانتی ماندگار عرضه می‌کنیم",
      description:
        "محصولات این برندها با همان کد گارانتی، سرویس‌کار مجاز و قطعه اصلی ماندگار پشتیبانی می‌شوند.",
      viewBrand: "محصولات {name}",
    },
    cta: {
      eyebrow: "همکاری با ماندگار",
      title: "بیا چیزی ماندگار بسازیم",
      description: "نمایندگی، صادرات یا پیوستن به تیم؛ پیامت مستقیم به واحد مربوط می‌رسد.",
      links: [
        {
          department: "partnership",
          title: "نمایندگی فروش و خدمات",
          body: "شبکه ماندگار را به شهر خودت بیاور.",
        },
        {
          department: "export",
          title: "صادرات و خرید عمده",
          body: "برای سفارش عمده و بازارهای کشورهای همسایه.",
        },
        {
          department: "general",
          title: "فرصت‌های شغلی",
          body: "به تیم مهندسی، تولید یا خدمات ماندگار بپیوند.",
        },
      ],
    },
    facts: {
      title: "مشخصات شرکت",
      legalName: "نام ثبتی",
      foundingYear: "سال تأسیس",
      nationalId: "شناسه ملی",
      registrationNo: "شماره ثبت",
      yearFormat: "{jalali}",
    },
  },
  en: {
    metaTitle: "About Mandegar",
    metaDescription:
      "Mandegar means lasting. Meet the story, values, build process and service network behind the coolers, heaters and water heaters made for Iranian homes.",
    hero: {
      eyebrow: "About Mandegar",
      titleAccent: "Mandegar",
      titleRest: " means what lasts",
      mission:
        "We build home appliances for years of trouble-free service: specs you can verify, parts and technicians in every province, and designs that cope with the heat of the south and the cold of the north-west.",
      primaryCta: "Explore products",
      secondaryCta: "Find a dealer",
      entryLabel: "What the name Mandegar means",
      word: "Mandegar",
      pronunciation: "mɑːn·de·gɑːr",
      partOfSpeech: "adjective · Persian",
      senses: [
        "Lasting; that which endures over time.",
        "A brand that builds its appliances for decades of work in Iranian homes.",
      ],
    },
    story: {
      eyebrow: "Our story",
      title: "From a small workshop to a nationwide network",
      placeholder: "Placeholder copy; the real company history replaces it before launch",
      paragraphs: [
        "Mandegar started in a small workshop building evaporative coolers, on a simple belief: an appliance you switch on every summer should run for years without trouble, and when it does need a repair, the repair should be easy.",
        "Gas heaters, water heaters and kitchen appliances followed, and our technician network grew from a few cities to every province. Today each unit carries a unique warranty code, and its parts stay available for years after production ends.",
      ],
      milestonesLabel: "Milestones",
      milestones: [
        {
          year: 1372,
          title: "A workshop beginning",
          body: "The first Mandegar evaporative cooler, with a galvanized body.",
        },
        {
          year: 1381,
          title: "A heating line",
          body: "Gas heaters and water heaters joined the range.",
        },
        {
          year: 1390,
          title: "Service in every province",
          body: "Authorized Mandegar technicians across the country.",
        },
        {
          year: 1398,
          title: "A durability lab",
          body: "Every model passes cycle-life testing before launch.",
        },
        {
          year: 1404,
          title: "Checkable warranty codes",
          body: "Each unit ships with a unique code that shows its warranty status.",
        },
      ],
    },
    symbol: {
      eyebrow: "The Mandegar symbol",
      title: "Four tiles, one turn",
      description:
        "The Mandegar symbol is four identical tiles turning around one centre. It has no letters, so it sits on any appliance and keeps its meaning under any name.",
      figureLabel: "The Mandegar symbol: four warm and cool tiles turning around one centre",
      items: [
        {
          title: "A windcatcher, from above",
          body: "Seen from above, a four-sided Persian windcatcher is a square split into four shafts, each catching the wind from a different side. They have cooled homes in Yazd for centuries without power: lasting, by design.",
        },
        {
          title: "Blades in motion",
          body: "The rounded corners of all four tiles turn the same way, like the blades that move air through a cooler and warmth through a heater.",
        },
        {
          title: "Four seasons",
          body: "Two warm tiles for the cold months and two cool tiles for the hot months: Mandegar is there in every season, year after year.",
        },
        {
          title: "Every side of Iran",
          body: "Four sides mean everywhere: from north to south and east to west, an authorised technician and genuine parts are close to you.",
        },
      ],
    },
    values: {
      eyebrow: "Our values",
      title: "Four promises we make to every home",
      items: [
        {
          icon: Hourglass,
          title: "Durability first",
          body: "We choose parts for years of service, not the lowest price. Every model passes cycle-life testing before it ships.",
        },
        {
          icon: Ruler,
          title: "Honest specs",
          body: "The number in the catalogue is the number we measured in the lab: airflow, power draw and energy class, without inflation.",
        },
        {
          icon: MapPinned,
          title: "Service everywhere",
          body: "From Bandar Abbas to Tabriz, an authorized technician and genuine parts are close by, and every request gets a tracking code.",
        },
        {
          icon: SunSnow,
          title: "Made for Iran's climates",
          body: "A cooler that copes with Gulf humidity and a heater that holds up in an Ardabil winter: our design starts with this country's weather.",
        },
      ],
    },
    stats: {
      eyebrow: "Mandegar in numbers",
      title: "The numbers behind the promise",
      description:
        "These figures come straight from the Mandegar system and update with every new model and dealer.",
      labels: {
        years: "years of manufacturing",
        models: "models in the range",
        serviceCenters: "dealers and service centres",
        warrantyMonths: "months of official warranty",
      },
    },
    process: {
      eyebrow: "How we build",
      title: "From drawing board to after-sales",
      description:
        "Every Mandegar appliance passes four stations, and at the last one our work is only beginning.",
      steps: [
        {
          icon: PencilRuler,
          title: "Design",
          body: "Every model starts from real household needs: floor area, climate and the power supply at hand.",
        },
        {
          icon: FlaskConical,
          title: "Testing",
          body: "Prototypes run for weeks in hot and cold rooms, on unstable voltage and hard water.",
        },
        {
          icon: Factory,
          title: "Production",
          body: "Quality checks at every station of the line, and a final test on every single unit.",
        },
        {
          icon: Wrench,
          title: "After-sales",
          body: "A warranty code, authorized technicians and genuine parts: we stay with you after the sale.",
        },
      ],
    },
    quality: {
      eyebrow: "Quality and standards",
      title: "The certifications behind every model",
      description:
        "Mandegar products are built and tested to Iran's national standards. Each certificate number will be published here once it is confirmed.",
      placeholder: "Placeholder; marks and certificate numbers are replaced before launch",
      badges: [
        {
          icon: ShieldCheck,
          mark: "ISIRI",
          title: "Iranian national standard mark",
          body: "Iranian National Standards Organization",
        },
        {
          icon: Leaf,
          mark: "A",
          title: "Energy class label",
          body: "Each model's class on its product page",
        },
        {
          icon: Award,
          mark: "ISO 9001",
          title: "Quality management system",
          body: "Design, production and service processes",
        },
        {
          icon: Gauge,
          mark: "GAS",
          title: "Gas appliance approval",
          body: "For gas heaters and water heaters",
        },
      ],
    },
    brands: {
      eyebrow: "Partner brands",
      title: "Brands we sell with the Mandegar warranty",
      description:
        "Products from these brands are backed by the same Mandegar warranty code, authorized technicians and genuine parts.",
      viewBrand: "{name} products",
    },
    cta: {
      eyebrow: "Work with Mandegar",
      title: "Let's build something lasting",
      description:
        "Dealership, export or joining the team: your message goes straight to the right department.",
      links: [
        {
          department: "partnership",
          title: "Dealership and service",
          body: "Bring the Mandegar network to your city.",
        },
        {
          department: "export",
          title: "Export and bulk orders",
          body: "For volume orders and neighbouring markets.",
        },
        {
          department: "general",
          title: "Careers",
          body: "Join our engineering, production or service teams.",
        },
      ],
    },
    facts: {
      title: "Company details",
      legalName: "Legal name",
      foundingYear: "Founded",
      nationalId: "National ID",
      registrationNo: "Registration number",
      yearFormat: "{gregorian} ({jalali} SH)",
    },
  },
};

export interface ContactContent {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  departments: Record<ContactDepartment, string>;
  fields: {
    department: string;
    name: string;
    phone: string;
    phonePlaceholder: string;
    email: string;
    subject: string;
    message: string;
    messagePlaceholder: string;
    website: string;
  };
  privacyNote: string;
  submit: string;
  submitting: string;
  errors: {
    department: string;
    nameShort: string;
    nameLong: string;
    phone: string;
    email: string;
    subjectShort: string;
    subjectLong: string;
    messageShort: string;
    messageLong: string;
    altcha: string;
  };
  toasts: {
    invalid: string;
    expired: string;
    challenge: string;
    rateLimited: string;
    failed: string;
    failedHint: string;
  };
  success: { title: string; body: string; again: string };
  channels: {
    title: string;
    phones: string;
    emails: string;
    address: string;
    hours: string;
    socials: string;
    call: string;
    write: string;
    neshan: string;
    balad: string;
    mapHint: string;
  };
  afterSales: { title: string; body: string; action: string };
}

export const contactContent: Record<Locale, ContactContent> = {
  fa: {
    metaTitle: "تماس با ماندگار",
    metaDescription:
      "شماره تلفن، ایمیل و نشانی دفتر مرکزی ماندگار، و فرم تماس برای فروش، نمایندگی، صادرات و پرسش‌های عمومی.",
    eyebrow: "تماس با ما",
    title: "با ماندگار در تماس باش",
    description:
      "پرسش فروش، درخواست نمایندگی یا پیشنهاد؟ پیامت مستقیم به واحد مربوط می‌رسد و در روزهای کاری پاسخ می‌گیری.",
    formTitle: "فرستادن پیام",
    formDescription: "واحد مربوط را انتخاب کن تا پیامت بی‌واسطه به دست کارشناس همان بخش برسد.",
    departments: {
      general: "عمومی",
      sales: "فروش و نمایندگی‌ها",
      support: "پشتیبانی فنی",
      partnership: "همکاری و اخذ نمایندگی",
      export: "صادرات",
    },
    fields: {
      department: "واحد",
      name: "نام و نام خانوادگی",
      phone: "شماره موبایل",
      phonePlaceholder: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
      email: "ایمیل",
      subject: "موضوع",
      message: "متن پیام",
      messagePlaceholder: "هر چه دقیق‌تر بنویسی، سریع‌تر و درست‌تر پاسخ می‌دهیم.",
      website: "وب‌سایت",
    },
    privacyNote: "اطلاعات تماس فقط برای پاسخ به همین پیام استفاده می‌شود.",
    submit: "فرستادن پیام",
    submitting: "در حال فرستادن…",
    errors: {
      department: "یکی از واحدها را انتخاب کن",
      nameShort: "نامت را کامل بنویس",
      nameLong: "نام حداکثر ۸۰ نویسه باشد",
      phone: "شماره موبایل معتبر بنویس؛ مثل ۰۹۱۲۳۴۵۶۷۸۹",
      email: "ایمیل معتبر بنویس یا خالی بگذار",
      subjectShort: "موضوع را دست‌کم در ۳ نویسه بنویس",
      subjectLong: "موضوع حداکثر ۱۲۰ نویسه باشد",
      messageShort: "پیامت دست‌کم ۱۰ نویسه باشد",
      messageLong: "پیامت حداکثر ۳۰۰۰ نویسه باشد",
      altcha: "بررسی امنیتی هنوز تمام نشده؛ چند ثانیه صبر کن",
    },
    toasts: {
      invalid: "چند فیلد نیاز به اصلاح دارد",
      expired: "فرم منقضی شد؛ یک بار دیگر بفرست",
      challenge: "بررسی امنیتی تأیید نشد؛ دوباره امتحان کن",
      rateLimited: "پیام‌های زیادی فرستاده‌ای؛ کمی بعد دوباره امتحان کن",
      failed: "پیام فرستاده نشد",
      failedHint: "اتصال اینترنت را بررسی کن و دوباره بفرست.",
    },
    success: {
      title: "پیامت رسید",
      body: "کارشناس واحد مربوط در روزهای کاری با شماره‌ای که وارد کردی تماس می‌گیرد یا به ایمیلت پاسخ می‌دهد.",
      again: "فرستادن پیام دیگر",
    },
    channels: {
      title: "راه‌های ارتباطی",
      phones: "تلفن",
      emails: "ایمیل",
      address: "دفتر مرکزی",
      hours: "ساعت پاسخ‌گویی",
      socials: "ماندگار در شبکه‌های اجتماعی",
      call: "تماس با {label}",
      write: "ایمیل به {label}",
      neshan: "مسیریابی با نشان",
      balad: "مسیریابی با بلد",
      mapHint: "باز شدن در نقشه",
    },
    afterSales: {
      title: "دستگاهت تعمیر یا سرویس لازم دارد؟",
      body: "برای خرابی، گارانتی و قطعه، درخواست خدمات ثبت کن. این مسیر رسمی پیگیری است و کد رهگیری می‌گیری.",
      action: "ثبت درخواست خدمات",
    },
  },
  en: {
    metaTitle: "Contact Mandegar",
    metaDescription:
      "Mandegar head office phone numbers, email and address, plus a contact form for sales, dealerships, export and general questions.",
    eyebrow: "Contact us",
    title: "Get in touch with Mandegar",
    description:
      "A sales question, a dealership enquiry or a suggestion? Your message goes straight to the right department and gets a reply on business days.",
    formTitle: "Send a message",
    formDescription: "Pick a department so your message reaches the right specialist directly.",
    departments: {
      general: "General",
      sales: "Sales and dealers",
      support: "Technical support",
      partnership: "Partnerships and dealerships",
      export: "Export",
    },
    fields: {
      department: "Department",
      name: "Full name",
      phone: "Mobile number",
      phonePlaceholder: "0912 345 6789",
      email: "Email",
      subject: "Subject",
      message: "Message",
      messagePlaceholder: "The more detail you give, the faster and better we can answer.",
      website: "Website",
    },
    privacyNote: "Your contact details are only used to reply to this message.",
    submit: "Send message",
    submitting: "Sending…",
    errors: {
      department: "Choose a department",
      nameShort: "Enter your full name",
      nameLong: "Keep your name under 80 characters",
      phone: "Enter a valid Iranian mobile number, e.g. 09123456789",
      email: "Enter a valid email or leave it empty",
      subjectShort: "Write a subject of at least 3 characters",
      subjectLong: "Keep the subject under 120 characters",
      messageShort: "Write at least 10 characters",
      messageLong: "Keep your message under 3,000 characters",
      altcha: "The security check is still running; give it a few seconds",
    },
    toasts: {
      invalid: "A few fields need fixing",
      expired: "The form expired; please send it once more",
      challenge: "The security check failed; try again",
      rateLimited: "You've sent several messages; try again a little later",
      failed: "Message not sent",
      failedHint: "Check your connection and send it again.",
    },
    success: {
      title: "Message received",
      body: "A specialist from the department will call the number you entered or reply by email on business days.",
      again: "Send another message",
    },
    channels: {
      title: "Ways to reach us",
      phones: "Phone",
      emails: "Email",
      address: "Head office",
      hours: "Opening hours",
      socials: "Mandegar on social media",
      call: "Call {label}",
      write: "Email {label}",
      neshan: "Directions in Neshan",
      balad: "Directions in Balad",
      mapHint: "Opens in a map app",
    },
    afterSales: {
      title: "Does your appliance need a repair?",
      body: "For faults, warranty claims and parts, submit a service request. It is our official channel and gives you a tracking code.",
      action: "Request service",
    },
  },
};
