import type { ContactSettings, LocalizedGuideStep, SettingsValues } from "@/types/admin";
import type { LocalizedText } from "@/types/common";
import type { FaqGroup, PostKind, ServiceCenterKind } from "@/types/content";

import type { CategorySlug } from "./catalog-data";
import { t } from "./helpers";

interface GuideSeed {
  slug: string;
  category: CategorySlug;
  poster: string;
  aparatHash: string;
  durationSec: number;
  title: LocalizedText;
  summary: LocalizedText;
  steps: (Omit<LocalizedGuideStep, "mediaId"> & { photo: string | null })[];
  tools: LocalizedText[];
  safety: LocalizedText[];
  chapters: { title: LocalizedText; startSec: number }[];
}

interface SlideSeed {
  key: string;
  photo: string;
  tone: "light" | "dark";
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string;
}

interface FaqSeed {
  key: string;
  group: FaqGroup;
  question: LocalizedText;
  answer: LocalizedText;
}

interface AuthorSeed {
  slug: string;
  photo: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
}

interface PostSeed {
  slug: string;
  kind: PostKind;
  author: string;
  photo: string;
  daysAgo: number;
  related: string[];
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
}

interface ServiceCenterSeed {
  slug: string;
  kind: ServiceCenterKind;
  province: string;
  lat: number;
  lng: number;
  name: LocalizedText;
  city: LocalizedText;
  address: LocalizedText;
  categories: CategorySlug[] | "all";
}

interface PolicySeed {
  key: "care" | "care-plus";
  name: LocalizedText;
  months: number;
  partsMonths: number;
  startRule: LocalizedText;
  coverage: LocalizedText[];
  exclusions: LocalizedText[];
}

const step = (title: LocalizedText, body: LocalizedText, photo: string | null = null) => ({
  title,
  body,
  photo,
});

export const guideSeeds: GuideSeed[] = [
  {
    slug: "evaporative-cooler-installation",
    category: "evaporative-coolers",
    poster: "1681042803902-f79c240d8f03",
    aparatHash: "mandegar-cooler-install",
    durationSec: 420,
    title: t("راهنمای نصب کولر آبی", "Installing an evaporative cooler"),
    summary: t(
      "از انتخاب محل و ساخت پایه تا اتصال کانال و آب، همه مراحل نصب کولر آبی را قدم‌به‌قدم ببینید.",
      "From choosing the spot and building the stand to connecting the duct and water, follow every step of a cooler install.",
    ),
    steps: [
      step(
        t("انتخاب محل نصب", "Choose the location"),
        t(
          "کولر را جایی نصب کنید که هوای تازه و سایه داشته باشد و فاصله کانال تا اولین دریچه از شش متر بیشتر نشود.",
          "Pick a shaded spot with fresh air, and keep the duct run to the first vent under six metres.",
        ),
        "1681042803902-f79c240d8f03",
      ),
      step(
        t("ساخت و تراز کردن پایه", "Build and level the stand"),
        t(
          "پایه فلزی را محکم به سقف یا دیوار ببندید و با تراز، شیب ملایمی به سمت تخلیه آب ایجاد کنید.",
          "Fix the metal stand firmly to the roof or wall, and use a level to give it a gentle fall towards the drain.",
        ),
      ),
      step(
        t("اتصال کانال با برزنت", "Connect the duct with canvas"),
        t(
          "دهانه کولر را با برزنت نسوز به کانال وصل کنید تا لرزش موتور به ساختمان منتقل نشود.",
          "Join the cooler outlet to the duct with fire-resistant canvas so motor vibration does not travel into the building.",
        ),
      ),
      step(
        t("اتصال آب و برق", "Connect water and power"),
        t(
          "شیر آب را با شیلنگ تقویت‌شده به شناور وصل کنید و برق کولر را از کلید جداگانه با فیوز مناسب بگیرید.",
          "Feed the float valve with a reinforced hose, and power the cooler from its own switch with a suitable breaker.",
        ),
      ),
      step(
        t("آزمایش نهایی", "Final test"),
        t(
          "پمپ را چند دقیقه روشن بگذارید تا پوشال‌ها کاملاً خیس شوند، سپس موتور را در دور کند و تند امتحان کنید.",
          "Run the pump for a few minutes until the pads are soaked, then test the motor on low and high speed.",
        ),
      ),
    ],
    tools: [
      t("تراز", "Spirit level"),
      t("دریل و مته", "Drill and bits"),
      t("آچار فرانسه", "Adjustable wrench"),
      t("برزنت نسوز", "Fire-resistant canvas"),
    ],
    safety: [
      t(
        "پیش از هر کار، برق کولر را از تابلو قطع کنید.",
        "Switch off the cooler's power at the panel before any work.",
      ),
      t(
        "روی پشت‌بام از کمربند ایمنی استفاده کنید.",
        "Wear a safety harness when working on the roof.",
      ),
    ],
    chapters: [
      { title: t("انتخاب محل", "Location"), startSec: 0 },
      { title: t("پایه و کانال", "Stand and duct"), startSec: 95 },
      { title: t("آب و برق", "Water and power"), startSec: 240 },
      { title: t("آزمایش", "Testing"), startSec: 360 },
    ],
  },
  {
    slug: "gas-heater-installation",
    category: "gas-heaters",
    poster: "1698933787134-af2d451985c7",
    aparatHash: "mandegar-heater-install",
    durationSec: 360,
    title: t("راهنمای نصب ایمن بخاری گازی", "Installing a gas heater safely"),
    summary: t(
      "اتصال درست دودکش، آزمایش نشتی و تنظیم شعله؛ نکاتی که جان خانواده را حفظ می‌کند.",
      "Fitting the flue correctly, leak-testing and setting the flame: the steps that keep your family safe.",
    ),
    steps: [
      step(
        t("بررسی دودکش", "Check the flue"),
        t(
          "دودکش باید باز، بدون ترک و دست‌کم یک متر بالاتر از بام باشد. کلاهک H شکل از برگشت دود جلوگیری می‌کند.",
          "The flue must be clear, crack-free and at least one metre above the roof. An H-shaped cowl prevents backdraught.",
        ),
      ),
      step(
        t("اتصال لوله بخاری", "Connect the flue pipe"),
        t(
          "لوله بخاری را با شیب رو به بالا و حداکثر سه زانو به دودکش وصل کنید و درزها را با بست فلزی محکم کنید.",
          "Run the flue pipe upwards with no more than three elbows, and secure every joint with a metal clamp.",
        ),
        "1547186577-a3f4fa07c2ef",
      ),
      step(
        t("اتصال گاز و آزمایش نشتی", "Connect gas and leak-test"),
        t(
          "شیلنگ استاندارد را با بست به شیر گاز ببندید و همه اتصالات را با کف صابون آزمایش کنید. هرگز از شعله برای یافتن نشتی استفاده نکنید.",
          "Clamp an approved hose to the gas valve and test every joint with soapy water. Never use a flame to look for leaks.",
        ),
        "1728509741559-44172bcd86b3",
      ),
      step(
        t("روشن کردن و تنظیم شعله", "Light and adjust the flame"),
        t(
          "شعله سالم آبی است. شعله زرد یا دوده‌دار نشانه احتراق ناقص است و باید سرویس‌کار مجاز آن را بررسی کند.",
          "A healthy flame is blue. A yellow or sooty flame means incomplete combustion and needs an authorized technician.",
        ),
      ),
    ],
    tools: [
      t("آچار فرانسه", "Adjustable wrench"),
      t("بست فلزی", "Metal clamps"),
      t("کف صابون", "Soapy water"),
      t("پیچ‌گوشتی", "Screwdriver"),
    ],
    safety: [
      t(
        "در صورت استشمام بوی گاز، شیر اصلی را ببندید، پنجره‌ها را باز کنید و با ۱۹۴ تماس بگیرید.",
        "If you smell gas, close the main valve, open the windows and call 194.",
      ),
      t("بخاری را هرگز بدون دودکش روشن نکنید.", "Never run the heater without a flue."),
      t(
        "در اتاق خواب از هشداردهنده مونوکسید کربن استفاده کنید.",
        "Fit a carbon monoxide alarm in bedrooms.",
      ),
    ],
    chapters: [
      { title: t("دودکش", "Flue"), startSec: 0 },
      { title: t("اتصال گاز", "Gas connection"), startSec: 140 },
      { title: t("تنظیم شعله", "Flame setup"), startSec: 270 },
    ],
  },
  {
    slug: "electric-heater-setup",
    category: "electric-heaters",
    poster: "1669722820990-2801092c0986",
    aparatHash: "mandegar-electric-heater",
    durationSec: 180,
    title: t("راه‌اندازی و استفاده ایمن از بخاری برقی", "Setting up an electric heater safely"),
    summary: t(
      "جای مناسب، پریز درست و تنظیم ترموستات؛ سه نکته برای گرمایش برقی ایمن و کم‌هزینه.",
      "The right spot, the right socket and a well-set thermostat: three keys to safe, affordable electric heating.",
    ),
    steps: [
      step(
        t("انتخاب جای مناسب", "Choose a good spot"),
        t(
          "بخاری را روی سطح صاف و دست‌کم یک متر دور از پرده، مبل و رختخواب بگذارید.",
          "Stand the heater on a flat surface at least one metre from curtains, sofas and bedding.",
        ),
      ),
      step(
        t("اتصال به پریز", "Plug it in"),
        t(
          "دوشاخه را مستقیم به پریز ارت‌دار بزنید و از سه‌راهی یا سیم رابط استفاده نکنید.",
          "Plug directly into an earthed socket and avoid adapters or extension leads.",
        ),
      ),
      step(
        t("تنظیم ترموستات", "Set the thermostat"),
        t(
          "ابتدا با توان کامل اتاق را گرم کنید، سپس ترموستات را روی دمای ۲۰ تا ۲۲ درجه بگذارید.",
          "Warm the room on full power first, then set the thermostat to 20–22 °C.",
        ),
        "1740847262528-a29f09775256",
      ),
    ],
    tools: [t("پریز ارت‌دار", "Earthed socket")],
    safety: [
      t("روی بخاری لباس یا حوله پهن نکنید.", "Never dry clothes or towels on the heater."),
      t("هنگام خروج از خانه، بخاری را خاموش کنید.", "Switch the heater off when you leave home."),
    ],
    chapters: [],
  },
  {
    slug: "water-heater-installation",
    category: "water-heaters",
    poster: "1620653713380-7a34b773fef8",
    aparatHash: "mandegar-water-heater",
    durationSec: 480,
    title: t("راهنمای نصب آبگرمکن گازی", "Installing a gas water heater"),
    summary: t(
      "نصب آبگرمکن دیواری و ایستاده، از اتصال لوله‌های آب سرد و گرم تا شیر اطمینان و دودکش.",
      "Installing wall-mounted and floor-standing heaters, from hot and cold pipework to the relief valve and flue.",
    ),
    steps: [
      step(
        t("آماده‌سازی محل", "Prepare the location"),
        t(
          "آبگرمکن را در فضایی با تهویه مناسب و نزدیک دودکش نصب کنید. نصب در حمام و اتاق خواب ممنوع است.",
          "Install the heater in a well-ventilated space close to the flue. Bathrooms and bedrooms are not allowed.",
        ),
      ),
      step(
        t("اتصال لوله‌های آب", "Connect the water pipes"),
        t(
          "آب سرد را به ورودی آبی و آب گرم را به خروجی قرمز وصل کنید و روی ورودی، شیر یک‌طرفه بگذارید.",
          "Connect cold water to the blue inlet and hot water to the red outlet, with a non-return valve on the inlet.",
        ),
        "1607472586893-edb57bdc0e39",
      ),
      step(
        t("نصب شیر اطمینان", "Fit the relief valve"),
        t(
          "شیر اطمینان دما و فشار را ببندید و خروجی آن را با لوله به کف‌شوی برسانید.",
          "Fit the temperature-pressure relief valve and pipe its outlet to a floor drain.",
        ),
        "1620653713380-7a34b773fef8",
      ),
      step(
        t("پر کردن مخزن و روشن کردن", "Fill the tank and light up"),
        t(
          "پیش از روشن کردن مشعل، مخزن را کاملاً پر کنید تا هوای آن از شیر آب گرم خارج شود.",
          "Fill the tank completely and bleed air from a hot tap before lighting the burner.",
        ),
      ),
    ],
    tools: [
      t("آچار لوله‌گیر", "Pipe wrench"),
      t("نوار تفلون", "PTFE tape"),
      t("دریل", "Drill"),
      t("تراز", "Spirit level"),
    ],
    safety: [
      t("آبگرمکن خالی را هرگز روشن نکنید.", "Never light an empty water heater."),
      t(
        "شیر اطمینان را هر شش ماه یک‌بار دستی آزمایش کنید.",
        "Test the relief valve by hand every six months.",
      ),
    ],
    chapters: [
      { title: t("محل نصب", "Location"), startSec: 0 },
      { title: t("لوله‌کشی", "Pipework"), startSec: 120 },
      { title: t("شیر اطمینان", "Relief valve"), startSec: 300 },
      { title: t("راه‌اندازی", "Commissioning"), startSec: 400 },
    ],
  },
  {
    slug: "gas-hob-installation",
    category: "kitchen-appliances",
    poster: "1608454781855-613047b52c94",
    aparatHash: "mandegar-gas-hob",
    durationSec: 240,
    title: t("راهنمای نصب اجاق گاز رومیزی", "Installing a built-in gas hob"),
    summary: t(
      "برش صفحه کابینت، آب‌بندی، اتصال گاز و آزمایش شعله‌ها برای نصب تمیز و ایمن اجاق گاز.",
      "Cutting the worktop, sealing, connecting the gas and testing the burners for a clean, safe hob install.",
    ),
    steps: [
      step(
        t("برش صفحه کابینت", "Cut the worktop"),
        t(
          "ابعاد برش را از الگوی داخل جعبه بردارید و دست‌کم پنج سانتی‌متر از دیوار فاصله بگذارید.",
          "Take the cut-out size from the template in the box and leave at least five centimetres from the wall.",
        ),
      ),
      step(
        t("آب‌بندی و جاگذاری", "Seal and fit"),
        t(
          "نوار آب‌بند را دور لبه اجاق بچسبانید و آن را با گیره‌ها به صفحه کابینت محکم کنید.",
          "Apply the sealing strip around the hob edge and secure it to the worktop with the clamps.",
        ),
        "1608454770647-01dc0f7dd97d",
      ),
      step(
        t("اتصال گاز و آزمایش", "Connect gas and test"),
        t(
          "شیلنگ استاندارد را وصل کنید، اتصالات را با کف صابون آزمایش کنید و همه شعله‌ها را یکی‌یکی روشن کنید.",
          "Connect an approved hose, test the joints with soapy water and light each burner in turn.",
        ),
        "1608454781855-613047b52c94",
      ),
    ],
    tools: [
      t("اره عمودبر", "Jigsaw"),
      t("متر", "Tape measure"),
      t("آچار", "Spanner"),
      t("کف صابون", "Soapy water"),
    ],
    safety: [
      t("پیش از نصب، شیر اصلی گاز را ببندید.", "Close the main gas valve before you start."),
      t("در صورت استشمام بوی گاز با ۱۹۴ تماس بگیرید.", "If you smell gas, call 194."),
    ],
    chapters: [],
  },
];

export const slideSeeds: SlideSeed[] = [
  {
    key: "summer-coolers",
    photo: "1615529182904-14819c35db37",
    tone: "light",
    title: t("خنکای ماندگار برای تابستان", "Lasting cool for the summer"),
    subtitle: t(
      "کولرهای آبی سلولزی با مصرف کم و هوای همیشه تازه",
      "Cellulose evaporative coolers that sip power and keep the air fresh",
    ),
    ctaLabel: t("دیدن کولرها", "Browse coolers"),
    ctaHref: "/categories/evaporative-coolers",
  },
  {
    key: "winter-heaters",
    photo: "1698933787134-af2d451985c7",
    tone: "dark",
    title: t("گرمای امن، زمستان آرام", "Safe warmth, calm winters"),
    subtitle: t(
      "بخاری‌های گازی با سنسور اکسیژن و ترموکوپل",
      "Gas heaters with an oxygen sensor and thermocouple",
    ),
    ctaLabel: t("دیدن بخاری‌ها", "Browse heaters"),
    ctaHref: "/categories/gas-heaters",
  },
  {
    key: "warranty-check",
    photo: "1620653713380-7a34b773fef8",
    tone: "light",
    title: t("گارانتی محصولتان را در چند ثانیه بررسی کنید", "Check your warranty in seconds"),
    subtitle: t(
      "کد روی برچسب دستگاه را وارد کنید و اصالت کالا را ببینید",
      "Enter the code from the rating label to confirm your product is genuine",
    ),
    ctaLabel: t("استعلام گارانتی", "Check warranty"),
    ctaHref: "/warranty",
  },
  {
    key: "kitchen",
    photo: "1556911220-bff31c812dba",
    tone: "light",
    title: t("آشپزخانه‌ای که با شما می‌ماند", "A kitchen that lasts with you"),
    subtitle: t(
      "اجاق گاز، مایکروفر و لوازم کوچک با گارانتی ماندگار",
      "Hobs, microwaves and small appliances with Mandegar warranty",
    ),
    ctaLabel: t("لوازم آشپزخانه", "Kitchen appliances"),
    ctaHref: "/categories/kitchen-appliances",
  },
];

export const faqSeeds: FaqSeed[] = [
  {
    key: "general-made-in",
    group: "general",
    question: t("محصولات ماندگار کجا تولید می‌شوند؟", "Where are Mandegar products made?"),
    answer: t(
      "محصولات برند ماندگار در کارخانه ما در ایران طراحی و تولید می‌شوند. محصولات برندهای همکار با گارانتی و خدمات ماندگار عرضه می‌شوند.",
      "Mandegar-branded products are designed and built in our factory in Iran. Partner-brand products are sold with Mandegar warranty and service.",
    ),
  },
  {
    key: "general-buy",
    group: "general",
    question: t("محصولات ماندگار را از کجا بخرم؟", "Where can I buy Mandegar products?"),
    answer: t(
      "از نمایندگی‌های مجاز در سراسر کشور. فهرست و نشانی آن‌ها را در صفحه نمایندگی‌ها و خدمات ببینید.",
      "From authorized dealers across the country. Find them on the dealers and service page.",
    ),
  },
  {
    key: "general-prices",
    group: "general",
    question: t("چرا قیمت محصولات در سایت نیست؟", "Why aren't prices shown on the site?"),
    answer: t(
      "قیمت‌ها بسته به نمایندگی و شهر متفاوت است. برای استعلام قیمت با نزدیک‌ترین نمایندگی تماس بگیرید.",
      "Prices vary by dealer and city. Contact your nearest dealer for a quote.",
    ),
  },
  {
    key: "warranty-code",
    group: "warranty",
    question: t("کد گارانتی کجای دستگاه است؟", "Where is the warranty code on the product?"),
    answer: t(
      "کد گارانتی ۹ کاراکتری روی برچسب مشخصات فنی دستگاه و کارت گارانتی چاپ شده است. با اسکن کد QR کنار آن هم می‌توانید مستقیم به صفحه استعلام بروید.",
      "The 9-character warranty code is printed on the rating label and the warranty card. Scan the QR code next to it to open the check page directly.",
    ),
  },
  {
    key: "warranty-start",
    group: "warranty",
    question: t("گارانتی از چه زمانی شروع می‌شود؟", "When does the warranty start?"),
    answer: t(
      "از تاریخ نصب ثبت‌شده توسط نماینده مجاز. اگر نصب ثبت نشده باشد، سه ماه پس از تاریخ فاکتور فروش ملاک است.",
      "From the installation date recorded by an authorized dealer. If no installation was recorded, coverage starts three months after the sales invoice date.",
    ),
  },
  {
    key: "warranty-invalid",
    group: "warranty",
    question: t("چه چیزهایی گارانتی را باطل می‌کند؟", "What voids the warranty?"),
    answer: t(
      "نصب یا تعمیر توسط افراد غیرمجاز، نوسان شدید برق، استفاده نادرست و آسیب فیزیکی. جزئیات را در صفحه گارانتی ببینید.",
      "Installation or repair by unauthorized people, severe power surges, misuse and physical damage. See the warranty page for details.",
    ),
  },
  {
    key: "installation-free",
    group: "installation",
    question: t("آیا نصب رایگان است؟", "Is installation free?"),
    answer: t(
      "هزینه نصب به محل و شرایط ساختمان بستگی دارد و نمایندگی پیش از شروع کار آن را اعلام می‌کند.",
      "Installation cost depends on the site and building, and your dealer will quote it before starting.",
    ),
  },
  {
    key: "installation-self",
    group: "installation",
    question: t("می‌توانم خودم دستگاه را نصب کنم؟", "Can I install the appliance myself?"),
    answer: t(
      "برای وسایل گازسوز، نصب باید توسط سرویس‌کار مجاز انجام شود. برای پنکه و لوازم کوچک، راهنمای داخل جعبه کافی است.",
      "Gas appliances must be installed by an authorized technician. For fans and small appliances, the leaflet in the box is enough.",
    ),
  },
  {
    key: "products-parts",
    group: "products",
    question: t("قطعات یدکی تا چند سال در دسترس است؟", "How long are spare parts available?"),
    answer: t(
      "قطعات یدکی هر مدل دست‌کم هفت سال پس از توقف تولید آن در مراکز خدمات مجاز موجود است.",
      "Spare parts for every model stay available at authorized service centres for at least seven years after production ends.",
    ),
  },
  {
    key: "products-compare",
    group: "products",
    question: t("چطور مدل مناسب را انتخاب کنم؟", "How do I choose the right model?"),
    answer: t(
      "در صفحه مقایسه، تا چهار مدل را کنار هم ببینید یا راهنمای انتخاب در مجله ماندگار را بخوانید.",
      "Compare up to four models side by side, or read the buying guides in the Mandegar Journal.",
    ),
  },
  {
    key: "support-track",
    group: "support",
    question: t("چطور درخواست خدماتم را پیگیری کنم؟", "How do I track my service request?"),
    answer: t(
      "کد رهگیری و شماره موبایلی را که هنگام ثبت درخواست وارد کرده‌اید، در صفحه پیگیری درخواست وارد کنید.",
      "Enter the tracking code and the mobile number you used when submitting the request on the tracking page.",
    ),
  },
  {
    key: "support-time",
    group: "support",
    question: t("چقدر طول می‌کشد تا سرویس‌کار مراجعه کند؟", "How soon will a technician visit?"),
    answer: t(
      "کارشناسان ما حداکثر تا یک روز کاری با شما تماس می‌گیرند و زمان مراجعه را هماهنگ می‌کنند. درخواست‌های مربوط به بوی گاز فوری بررسی می‌شوند.",
      "Our team will call you within one business day to schedule a visit. Requests about a gas smell are handled immediately.",
    ),
  },
];

export const authorSeeds: AuthorSeed[] = [
  {
    slug: "sara-ahmadi",
    photo: "1573496359142-b8d87734a5a2",
    name: t("سارا احمدی", "Sara Ahmadi"),
    role: t("سردبیر محتوای فنی", "Technical content editor"),
    bio: t(
      "سارا احمدی مهندس مکانیک است و ده سال در طراحی سیستم‌های گرمایش و سرمایش خانگی کار کرده است. او در مجله ماندگار راهنماهای خرید و نگهداری می‌نویسد.",
      "Sara Ahmadi is a mechanical engineer with ten years in home heating and cooling design. She writes buying and maintenance guides for the Mandegar Journal.",
    ),
  },
  {
    slug: "reza-karimi",
    photo: "1560250097-0b93528c311a",
    name: t("رضا کریمی", "Reza Karimi"),
    role: t("سرپرست خدمات پس از فروش", "After-sales service lead"),
    bio: t(
      "رضا کریمی شبکه سرویس‌کاران ماندگار را مدیریت می‌کند و تجربه‌های میدانی تیمش را به نکته‌های کاربردی برای مشتریان تبدیل می‌کند.",
      "Reza Karimi runs Mandegar's technician network and turns his team's field experience into practical tips for customers.",
    ),
  },
];

const markdown = (...blocks: string[]) => blocks.join("\n\n");

export const postSeeds: PostSeed[] = [
  {
    slug: "prepare-your-cooler-for-summer",
    kind: "tips",
    author: "reza-karimi",
    photo: "1757219525975-03b5984bc6e8",
    daysAgo: 12,
    related: ["mc-3500", "mc-4500"],
    title: t(
      "آماده‌سازی کولر آبی برای تابستان در پنج قدم",
      "Five steps to get your cooler ready for summer",
    ),
    excerpt: t(
      "پیش از اولین روز گرم، با یک سرویس ساده عمر کولر را بیشتر و قبض برق را کمتر کنید.",
      "A simple service before the first hot day adds years to your cooler and trims your power bill.",
    ),
    body: t(
      markdown(
        "کولری که زمستان را زیر برف و باران گذرانده، پیش از روشن شدن به کمی رسیدگی نیاز دارد. این پنج قدم را به ترتیب انجام دهید.",
        "## ۱. تخلیه و شست‌وشوی تشتک\nرسوب و گل‌ولای کف تشتک، پمپ را زودتر از موعد خراب می‌کند. تشتک را تخلیه کنید و با برس نرم بشویید.",
        "## ۲. بررسی پوشال‌ها\nاگر پوشال سفت، رسوب‌گرفته یا پاره است، تعویضش کنید. پوشال سالم یعنی هوای خنک‌تر با برق کمتر.",
        "## ۳. آزمایش پمپ و شناور\n- پمپ را چند دقیقه روشن کنید و جریان آب روی پوشال‌ها را ببینید.\n- شناور را تنظیم کنید تا آب از سرریز بیرون نزند.",
        "## ۴. بازدید تسمه و موتور\nتسمه ترک‌خورده یا شل را عوض کنید. موتورهای ماندگار بلبرینگ آب‌بندی‌شده دارند و به روغن‌کاری نیاز ندارند.",
        "## ۵. باز کردن دریچه‌ها\nکولر آبی بدون خروج هوا کار نمی‌کند؛ یک پنجره را کمی باز بگذارید تا هوای گرم بیرون برود.",
      ),
      markdown(
        "A cooler that spent the winter under snow and rain needs a little care before it runs again. Work through these five steps in order.",
        "## 1. Drain and wash the sump\nSilt and scale in the sump wear the pump out early. Drain it and scrub it with a soft brush.",
        "## 2. Check the pads\nIf a pad is stiff, scaled or torn, replace it. Healthy pads mean cooler air for less power.",
        "## 3. Test the pump and float\n- Run the pump for a few minutes and watch the water spread across the pads.\n- Adjust the float so water never reaches the overflow.",
        "## 4. Inspect the belt and motor\nReplace a cracked or loose belt. Mandegar motors use sealed bearings and need no oiling.",
        "## 5. Open a window\nAn evaporative cooler needs somewhere for air to go, so leave a window slightly open to let warm air out.",
      ),
    ),
  },
  {
    slug: "gas-heater-safety-checklist",
    kind: "tips",
    author: "reza-karimi",
    photo: "1728509741559-44172bcd86b3",
    daysAgo: 40,
    related: ["mgh-9000", "mgh-12000"],
    title: t(
      "چک‌لیست ایمنی بخاری گازی پیش از سرما",
      "Gas heater safety checklist for the cold season",
    ),
    excerpt: t(
      "دودکش، شعله و شیلنگ؛ سه چیزی که پیش از روشن کردن بخاری باید بررسی کنید.",
      "Flue, flame and hose: three things to check before you light the heater.",
    ),
    body: t(
      markdown(
        "هر زمستان، گازگرفتگی جان چند خانواده را تهدید می‌کند، در حالی که بیشتر این حادثه‌ها با یک بازدید ساده قابل‌پیشگیری است.",
        "## دودکش\n- دودکش باید باز و بدون گرفتگی باشد.\n- کلاهک H شکل روی بام نصب شده باشد.\n- لوله بخاری کمتر از سه زانو داشته باشد.",
        "## شعله\nشعله سالم آبی و آرام است. شعله زرد، نارنجی یا دوده‌دار یعنی احتراق ناقص؛ بخاری را خاموش کنید و با سرویس‌کار مجاز تماس بگیرید.",
        "## شیلنگ و اتصالات\nشیلنگ گاز را از نظر ترک و سفتی بررسی کنید و اتصالات را با کف صابون آزمایش کنید.",
        "> اگر بوی گاز حس کردید، شیر اصلی را ببندید، پنجره‌ها را باز کنید، کلید برق را نزنید و با ۱۹۴ تماس بگیرید.",
      ),
      markdown(
        "Every winter carbon monoxide puts families at risk, yet most incidents can be prevented with a simple inspection.",
        "## Flue\n- The flue must be open and clear.\n- An H-shaped cowl should be fitted on the roof.\n- The flue pipe should have fewer than three elbows.",
        "## Flame\nA healthy flame is blue and steady. A yellow, orange or sooty flame means incomplete combustion: switch off and call an authorized technician.",
        "## Hose and joints\nCheck the gas hose for cracks and stiffness, and test the joints with soapy water.",
        "> If you smell gas, close the main valve, open the windows, don't touch any switches and call 194.",
      ),
    ),
  },
  {
    slug: "choosing-the-right-water-heater",
    kind: "guide",
    author: "sara-ahmadi",
    photo: "1594233078955-e1f73a02ebb2",
    daysAgo: 25,
    related: ["mwh-60", "mwh-150", "miw-12"],
    title: t("راهنمای انتخاب آبگرمکن مناسب خانه", "How to choose the right water heater"),
    excerpt: t(
      "مخزن‌دار یا فوری؟ ۶۰ لیتری یا ۱۵۰ لیتری؟ با چند سؤال ساده به انتخاب درست برسید.",
      "Tank or tankless? 60 litres or 150? A few simple questions lead to the right choice.",
    ),
    body: t(
      markdown(
        "انتخاب آبگرمکن به تعداد اعضای خانواده، تعداد حمام‌ها و فضای نصب بستگی دارد.",
        "## مخزن‌دار یا فوری؟\nآبگرمکن مخزن‌دار آب را از پیش گرم نگه می‌دارد و برای مصرف هم‌زمان چند شیر مناسب است. آبگرمکن فوری جای کمی می‌گیرد و فقط هنگام مصرف گاز می‌سوزاند.",
        "## حجم مناسب\n| اعضای خانواده | حجم پیشنهادی |\n| --- | --- |\n| ۱ تا ۲ نفر | ۵۰ تا ۶۰ لیتر |\n| ۳ تا ۴ نفر | ۸۰ تا ۱۰۰ لیتر |\n| ۵ نفر و بیشتر | ۱۵۰ لیتر |",
        "## محل نصب\nآبگرمکن گازی باید نزدیک دودکش و در فضایی با تهویه مناسب نصب شود؛ نصب آن در حمام و اتاق خواب ممنوع است.",
      ),
      markdown(
        "The right water heater depends on household size, the number of bathrooms and the space you have.",
        "## Tank or tankless?\nA storage heater keeps water hot and copes with several taps at once. An instant heater takes up little space and burns gas only while water is running.",
        "## Picking a size\n| Household | Suggested size |\n| --- | --- |\n| 1–2 people | 50–60 L |\n| 3–4 people | 80–100 L |\n| 5 or more | 150 L |",
        "## Where to install\nGas water heaters must sit close to a flue in a well-ventilated space; bathrooms and bedrooms are not allowed.",
      ),
    ),
  },
  {
    slug: "introducing-mc-4500",
    kind: "news",
    author: "sara-ahmadi",
    photo: "1681042803902-f79c240d8f03",
    daysAgo: 60,
    related: ["mc-4500"],
    title: t(
      "معرفی کولر آبی MC-4500 با پوشال سه‌بعدی",
      "Introducing the MC-4500 with 3D cellulose pads",
    ),
    excerpt: t(
      "نسل تازه کولرهای ماندگار با پوشال سه‌بعدی، هوای خنک‌تر را با برق کمتر می‌دهد.",
      "The new generation of Mandegar coolers uses 3D pads to deliver cooler air on less power.",
    ),
    body: t(
      markdown(
        "کولر آبی MC-4500 پرفروش‌ترین مدل ماندگار، حالا با پوشال سلولزی سه‌بعدی و پمپ قابل‌تعویض عرضه می‌شود.",
        "## چه چیزی تغییر کرده است؟\n- پوشال سه‌بعدی با سطح تماس بیشتر\n- پمپ کشویی که بدون باز کردن بدنه تعویض می‌شود\n- مخزن ۳۸ لیتری با شناور برنجی",
        "این مدل از همین ماه در نمایندگی‌های مجاز سراسر کشور عرضه می‌شود.",
      ),
      markdown(
        "The MC-4500, Mandegar's best-selling cooler, now ships with 3D cellulose pads and a replaceable pump.",
        "## What's new?\n- 3D pads with a larger contact area\n- A slide-out pump you can replace without opening the body\n- A 38 litre tank with a brass float valve",
        "The model is available this month from authorized dealers nationwide.",
      ),
    ),
  },
  {
    slug: "new-service-centers-isfahan-shiraz",
    kind: "news",
    author: "reza-karimi",
    photo: "1721332154191-ba5f1534266e",
    daysAgo: 8,
    related: [],
    title: t(
      "مراکز خدمات تازه ماندگار در اصفهان و شیراز",
      "New Mandegar service centres in Isfahan and Shiraz",
    ),
    excerpt: t(
      "دو مرکز خدمات مجاز تازه، زمان انتظار مشتریان مرکز و جنوب کشور را کوتاه‌تر می‌کند.",
      "Two new authorized service centres cut waiting times for customers in central and southern Iran.",
    ),
    body: t(
      markdown(
        "شبکه خدمات ماندگار با افتتاح دو مرکز تازه در اصفهان و شیراز گسترش یافت.",
        "این مراکز تعمیر، تعویض قطعه و نصب همه محصولات ماندگار و برندهای همکار را انجام می‌دهند. نشانی و شماره تماس آن‌ها را در صفحه نمایندگی‌ها و خدمات ببینید.",
      ),
      markdown(
        "Mandegar's service network has grown with two new centres in Isfahan and Shiraz.",
        "Both centres handle repairs, part replacements and installation for every Mandegar and partner-brand product. Find their addresses and phone numbers on the dealers and service page.",
      ),
    ),
  },
  {
    slug: "evaporative-cooler-sizing",
    kind: "guide",
    author: "sara-ahmadi",
    photo: "1583847268964-b28dc8f51f92",
    daysAgo: 90,
    related: ["mc-3500", "mc-4500", "mc-7000"],
    title: t(
      "کولر آبی چند هزار برای خانه شما مناسب است؟",
      "What size of evaporative cooler does your home need?",
    ),
    excerpt: t(
      "با یک محاسبه ساده بر اساس متراژ، ارتفاع سقف و جهت ساختمان، ظرفیت درست کولر را پیدا کنید.",
      "Use a simple calculation based on floor area, ceiling height and orientation to find the right cooler size.",
    ),
    body: t(
      markdown(
        "کولر کوچک‌تر از نیاز، خانه را خنک نمی‌کند و کولر بزرگ‌تر از نیاز، رطوبت و برق اضافه به خانه می‌آورد.",
        "## فرمول ساده\nحجم خانه (متراژ × ارتفاع سقف) را در عدد ۲۰ ضرب کنید تا هوادهی مورد نیاز بر حسب متر مکعب بر ساعت به دست آید.",
        "## مثال\nخانه ۸۰ متری با سقف ۲٫۸ متر: ۸۰ × ۲٫۸ × ۲۰ = ۴۴۸۰ متر مکعب بر ساعت؛ پس کولر MC-4500 انتخاب مناسبی است.",
        "## نکته\nبرای طبقه آخر و ساختمان‌های رو به جنوب، ۱۰ تا ۲۰ درصد به عدد به‌دست‌آمده اضافه کنید.",
      ),
      markdown(
        "An undersized cooler won't cool the home, and an oversized one adds humidity and wastes power.",
        "## A simple formula\nMultiply your home's volume (floor area × ceiling height) by 20 to get the airflow you need in m³/h.",
        "## Example\nAn 80 m² home with 2.8 m ceilings: 80 × 2.8 × 20 = 4,480 m³/h, so the MC-4500 is a good fit.",
        "## Tip\nFor top floors and south-facing buildings, add 10 to 20 percent to the result.",
      ),
    ),
  },
];

const center = (
  slug: string,
  kind: ServiceCenterKind,
  province: string,
  coordinates: [number, number],
  name: LocalizedText,
  city: LocalizedText,
  address: LocalizedText,
  categories: CategorySlug[] | "all" = "all",
): ServiceCenterSeed => ({
  slug,
  kind,
  province,
  lat: coordinates[0],
  lng: coordinates[1],
  name,
  city,
  address,
  categories,
});

const tehran = t("تهران", "Tehran");
const isfahan = t("اصفهان", "Isfahan");
const mashhad = t("مشهد", "Mashhad");
const shiraz = t("شیراز", "Shiraz");
const tabriz = t("تبریز", "Tabriz");
const ahvaz = t("اهواز", "Ahvaz");

export const serviceCenterSeeds: ServiceCenterSeed[] = [
  center(
    "tehran-central",
    "both",
    "23",
    [35.6892, 51.389],
    t("مرکز خدمات مرکزی ماندگار", "Mandegar Central Service Centre"),
    tehran,
    t("خیابان انقلاب، نبش خیابان فلسطین، پلاک ۱۲", "12 Felestin St, off Enghelab St"),
  ),
  center(
    "tehran-west",
    "service",
    "23",
    [35.7219, 51.3347],
    t("سرویس ماندگار غرب تهران", "Mandegar Service West Tehran"),
    tehran,
    t("بلوار اشرفی اصفهانی، خیابان مخبری، پلاک ۴۵", "45 Mokhberi St, Ashrafi Esfahani Blvd"),
  ),
  center(
    "tehran-east-dealer",
    "dealer",
    "23",
    [35.7058, 51.5014],
    t("نمایندگی فروش تهرانپارس", "Tehranpars Dealer"),
    tehran,
    t("فلکه دوم تهرانپارس، خیابان جشنواره، پلاک ۸", "8 Jashnvareh St, Second Square, Tehranpars"),
  ),
  center(
    "tehran-south",
    "both",
    "23",
    [35.6263, 51.4111],
    t("نمایندگی و خدمات خیابان مولوی", "Molavi St Dealer and Service"),
    tehran,
    t(
      "خیابان مولوی، بازار لوازم خانگی، طبقه اول، واحد ۱۴",
      "Unit 14, First Floor, Home Appliance Bazaar, Molavi St",
    ),
  ),
  center(
    "isfahan-chaharbagh",
    "both",
    "10",
    [32.6546, 51.668],
    t("نمایندگی و خدمات چهارباغ", "Chaharbagh Dealer and Service"),
    isfahan,
    t("خیابان چهارباغ عباسی، کوچه شهید اکبری، پلاک ۳", "3 Akbari Alley, Chaharbagh Abbasi St"),
  ),
  center(
    "isfahan-service",
    "service",
    "10",
    [32.6339, 51.6526],
    t("مرکز خدمات ماندگار اصفهان", "Mandegar Service Centre Isfahan"),
    isfahan,
    t("خیابان هزارجریب، نبش کوچه بهار، پلاک ۲۱", "21 Bahar Alley, Hezar Jarib St"),
  ),
  center(
    "isfahan-najafabad",
    "dealer",
    "10",
    [32.6342, 51.3667],
    t("نمایندگی نجف‌آباد", "Najafabad Dealer"),
    t("نجف‌آباد", "Najafabad"),
    t("خیابان امام خمینی، روبه‌روی پارک شهر", "Imam Khomeini St, opposite City Park"),
  ),
  center(
    "mashhad-ahmadabad",
    "both",
    "09",
    [36.3, 59.5767],
    t("نمایندگی و خدمات احمدآباد", "Ahmadabad Dealer and Service"),
    mashhad,
    t("خیابان احمدآباد، بین عارف ۲ و ۴، پلاک ۶۰", "60 Ahmadabad St, between Aref 2 and 4"),
  ),
  center(
    "mashhad-service",
    "service",
    "09",
    [36.2972, 59.6067],
    t("مرکز خدمات ماندگار مشهد", "Mandegar Service Centre Mashhad"),
    mashhad,
    t("بلوار وکیل‌آباد، وکیل‌آباد ۱۲، پلاک ۵", "5 Vakilabad 12, Vakilabad Blvd"),
  ),
  center(
    "mashhad-dealer",
    "dealer",
    "09",
    [36.3264, 59.5433],
    t("نمایندگی فروش بلوار سجاد", "Sajjad Blvd Dealer"),
    mashhad,
    t("بلوار سجاد، نبش بهارستان ۵", "Corner of Baharestan 5, Sajjad Blvd"),
  ),
  center(
    "shiraz-zand",
    "both",
    "07",
    [29.6103, 52.5311],
    t("نمایندگی و خدمات زند", "Zand Dealer and Service"),
    shiraz,
    t("خیابان زند، نبش کوچه ۱۰، پلاک ۲", "2 Alley 10, Zand St"),
  ),
  center(
    "shiraz-service",
    "service",
    "07",
    [29.6367, 52.5197],
    t("مرکز خدمات ماندگار شیراز", "Mandegar Service Centre Shiraz"),
    shiraz,
    t("بلوار چمران، کوچه ۱۸، پلاک ۷", "7 Alley 18, Chamran Blvd"),
  ),
  center(
    "tabriz-valiasr",
    "both",
    "03",
    [38.0667, 46.3167],
    t("نمایندگی و خدمات ولیعصر تبریز", "Valiasr Tabriz Dealer and Service"),
    tabriz,
    t("شهرک ولیعصر، خیابان توانیر، پلاک ۱۹", "19 Tavanir St, Valiasr Town"),
  ),
  center(
    "tabriz-service",
    "service",
    "03",
    [38.08, 46.2919],
    t("مرکز خدمات ماندگار تبریز", "Mandegar Service Centre Tabriz"),
    tabriz,
    t("خیابان امام، چهارراه منصور، پلاک ۳۳", "33 Mansour Junction, Imam St"),
    ["gas-heaters", "water-heaters", "electric-heaters"],
  ),
  center(
    "ahvaz-kianpars",
    "both",
    "06",
    [31.3183, 48.6842],
    t("نمایندگی و خدمات کیانپارس", "Kianpars Dealer and Service"),
    ahvaz,
    t("کیانپارس، خیابان ۱۴ غربی، پلاک ۹", "9 West 14th St, Kianpars"),
    ["evaporative-coolers", "fans", "kitchen-appliances"],
  ),
  center(
    "ahvaz-service",
    "service",
    "06",
    [31.3203, 48.6692],
    t("مرکز خدمات ماندگار اهواز", "Mandegar Service Centre Ahvaz"),
    ahvaz,
    t("خیابان نادری، نبش خیابان سیروس", "Corner of Sirous St, Naderi St"),
    ["evaporative-coolers", "fans", "water-heaters"],
  ),
];

export const policySeeds: PolicySeed[] = [
  {
    key: "care",
    name: t("مراقبت ماندگار ۱۸", "Mandegar Care 18"),
    months: 18,
    partsMonths: 84,
    startRule: t(
      "از تاریخ نصب ثبت‌شده توسط نماینده مجاز؛ در غیر این صورت سه ماه پس از تاریخ فاکتور فروش.",
      "From the installation date recorded by an authorized dealer, or three months after the invoice date if none was recorded.",
    ),
    coverage: [
      t("تعمیر یا تعویض رایگان قطعات معیوب", "Free repair or replacement of faulty parts"),
      t("اجرت سرویس‌کار مجاز در دوره گارانتی", "Authorized technician labour during the warranty"),
      t("تأمین قطعات یدکی تا هفت سال", "Spare parts for seven years"),
    ],
    exclusions: [
      t("نصب یا تعمیر توسط افراد غیرمجاز", "Installation or repair by unauthorized people"),
      t("آسیب ناشی از نوسان شدید برق", "Damage from severe power surges"),
      t("قطعات مصرفی مانند پوشال و تسمه", "Consumables such as pads and belts"),
      t("آسیب فیزیکی و استفاده نادرست", "Physical damage and misuse"),
    ],
  },
  {
    key: "care-plus",
    name: t("مراقبت ماندگار پلاس ۳۰", "Mandegar Care Plus 30"),
    months: 30,
    partsMonths: 84,
    startRule: t(
      "از تاریخ نصب و راه‌اندازی توسط سرویس‌کار مجاز، که در کارت گارانتی ثبت می‌شود.",
      "From installation and commissioning by an authorized technician, as recorded on the warranty card.",
    ),
    coverage: [
      t(
        "تعمیر یا تعویض رایگان قطعات معیوب، از جمله مشعل و مبدل حرارتی",
        "Free repair or replacement of faulty parts, including the burner and heat exchanger",
      ),
      t("اجرت سرویس‌کار مجاز در دوره گارانتی", "Authorized technician labour during the warranty"),
      t("یک بار سرویس دوره‌ای رایگان در سال اول", "One free periodic service in the first year"),
    ],
    exclusions: [
      t("نصب بدون دودکش استاندارد", "Installation without a standard flue"),
      t(
        "خوردگی ناشی از آب با سختی بیش از حد مجاز",
        "Corrosion from water harder than the stated limit",
      ),
      t("آسیب ناشی از یخ‌زدگی", "Frost damage"),
      t("آسیب فیزیکی و استفاده نادرست", "Physical damage and misuse"),
    ],
  },
];

const contact: ContactSettings = {
  phones: [
    { label: t("دفتر مرکزی", "Head office"), value: "+98 21 0000 0000" },
    { label: t("خدمات پس از فروش", "After-sales service"), value: "+98 21 0000 0001" },
  ],
  emails: [
    { label: t("پشتیبانی", "Support"), value: "support@mandegar.example" },
    { label: t("فروش و نمایندگی", "Sales and dealerships"), value: "sales@mandegar.example" },
  ],
  address: t(
    "تهران، خیابان انقلاب، نبش خیابان فلسطین، پلاک ۱۲ (نشانی نمونه)",
    "12 Felestin St, off Enghelab St, Tehran (placeholder address)",
  ),
  hours: t(
    "شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۳",
    "Saturday to Wednesday 8:00–17:00, Thursday 8:00–13:00",
  ),
  socials: {
    aparat: null,
    instagram: null,
    telegram: null,
    bale: null,
    eitaa: null,
    rubika: null,
    linkedin: null,
  },
  location: { lat: 35.7009, lng: 51.3899 },
};

export const settingsSeed = (
  demo: boolean,
  models: number,
  serviceCenters: number,
): SettingsValues => ({
  contact,
  seo: {
    defaultTitle: t("ماندگار | لوازم خانگی بادوام", "Mandegar | Durable Home Appliances"),
    defaultDescription: t(
      "کولر آبی، بخاری، آبگرمکن و لوازم خانگی ماندگار با گارانتی رسمی، راهنمای نصب و خدمات پس از فروش در سراسر ایران.",
      "Mandegar evaporative coolers, heaters, water heaters and home appliances with an official warranty, installation guides and nationwide after-sales service.",
    ),
  },
  stats: { years: demo ? 33 : 0, serviceCenters, models, warrantyMonths: 30 },
  company: {
    legalName: t(
      "شرکت صنایع لوازم خانگی ماندگار (نام نمونه)",
      "Mandegar Home Appliance Industries (placeholder name)",
    ),
    nationalId: null,
    registrationNo: null,
    foundingYear: demo ? 1372 : null,
  },
  features: { blog: true },
});
