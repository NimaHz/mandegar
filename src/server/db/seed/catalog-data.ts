import type {
  LocalizedFaq,
  LocalizedFeature,
  LocalizedSpecGroup,
  LocalizedSpecItem,
  SpecGroupTemplate,
} from "@/types/admin";
import type { EnergyClass } from "@/types/catalog";
import type { LocalizedText } from "@/types/common";

import { amount, describe, dimensions, measure, t, type Unit, units } from "./helpers";

export type BrandSlug = "mandegar" | "general" | "aras-home" | "nikan-electric";

export type CategorySlug =
  | "evaporative-coolers"
  | "gas-heaters"
  | "electric-heaters"
  | "water-heaters"
  | "kitchen-appliances"
  | "fans";

export interface BrandSeed {
  slug: BrandSlug;
  name: LocalizedText;
  description: LocalizedText;
  website: string | null;
  isOwn: boolean;
  sortOrder: number;
  logo: { primary: string; secondary: string; shape: "wave" | "ring" | "square" | "bolt" };
}

export interface CategorySeed {
  slug: CategorySlug;
  icon: string;
  photo: string;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  specTemplate: SpecGroupTemplate[];
  features: LocalizedFeature[];
  faqs: LocalizedFaq[];
  policy: "care" | "care-plus";
}

export interface ProductSeed {
  slug: string;
  modelCode: string;
  category: CategorySlug;
  brand: BrandSlug;
  featured: boolean;
  isNew: boolean;
  releaseYear: number;
  energyClass: EnergyClass | null;
  warrantyMonths: number;
  name: LocalizedText;
  tagline: LocalizedText;
  summary: LocalizedText;
  highlights: LocalizedText[];
  specs: LocalizedSpecGroup[];
  features: LocalizedFeature[];
  photos: string[];
}

export const brandSeeds: BrandSeed[] = [
  {
    slug: "mandegar",
    name: t("ماندگار", "Mandegar"),
    description: t(
      "ماندگار تولیدکننده ایرانی کولر آبی، بخاری، آبگرمکن و لوازم خانگی است. از سال ۱۳۷۲ محصولاتی ساده، بادوام و قابل‌تعمیر می‌سازیم و پشت هر دستگاه، شبکه‌ای از نمایندگی‌ها و سرویس‌کاران مجاز در سراسر کشور ایستاده است.",
      "Mandegar is an Iranian maker of evaporative coolers, heaters, water heaters and home appliances. Since 1993 we have built simple, durable, repairable products, backed by a nationwide network of authorized dealers and service technicians.",
    ),
    website: null,
    isOwn: true,
    sortOrder: 0,
    logo: { primary: "#E2A93B", secondary: "#1F8A8A", shape: "wave" },
  },
  {
    slug: "general",
    name: t("جنرال", "General"),
    description: t(
      "ماندگار گزیده‌ای از مایکروفرها، لوازم کوچک آشپزخانه و پنکه‌های جنرال را با گارانتی و خدمات پس از فروش خود عرضه می‌کند.",
      "Mandegar distributes a curated range of General microwaves, small kitchen appliances and fans, covered by Mandegar warranty and after-sales service.",
    ),
    website: null,
    isOwn: false,
    sortOrder: 1,
    logo: { primary: "#C0392B", secondary: "#F4F1EA", shape: "ring" },
  },
  {
    slug: "aras-home",
    name: t("آراس هوم", "Aras Home"),
    description: t(
      "آراس هوم برند همکار ماندگار در بخاری‌های گازی با طراحی شومینه‌ای است. نام و مشخصات این برند نمونه است و پیش از انتشار جایگزین می‌شود.",
      "Aras Home is a Mandegar partner brand for fireplace-style gas heaters. This brand is placeholder content and will be replaced before launch.",
    ),
    website: null,
    isOwn: false,
    sortOrder: 2,
    logo: { primary: "#6B4E9B", secondary: "#F4F1EA", shape: "square" },
  },
  {
    slug: "nikan-electric",
    name: t("نیکان الکتریک", "Nikan Electric"),
    description: t(
      "نیکان الکتریک برند همکار ماندگار در گرمایش برقی و پنل‌های دیواری است. نام و مشخصات این برند نمونه است و پیش از انتشار جایگزین می‌شود.",
      "Nikan Electric is a Mandegar partner brand for electric heating and wall panels. This brand is placeholder content and will be replaced before launch.",
    ),
    website: null,
    isOwn: false,
    sortOrder: 3,
    logo: { primary: "#2E6FB7", secondary: "#F4F1EA", shape: "bolt" },
  },
];

const label = {
  airflow: t("هوادهی", "Airflow"),
  power: t("توان مصرفی", "Power consumption"),
  tank: t("حجم مخزن آب", "Water tank"),
  coverage: t("متراژ مناسب", "Recommended area"),
  dimensions: t("ابعاد (طول × عرض × ارتفاع)", "Dimensions (L × W × H)"),
  weight: t("وزن", "Weight"),
  noise: t("سطح صدا", "Noise level"),
  energy: t("رده انرژی", "Energy class"),
  heatOutput: t("توان حرارتی", "Heat output"),
  gas: t("مصرف گاز", "Gas consumption"),
  efficiency: t("راندمان", "Efficiency"),
  levels: t("سطح توان", "Power levels"),
  fins: t("تعداد پره", "Fins"),
  capacity: t("حجم", "Capacity"),
  recovery: t("سرعت گرمایش آب", "Recovery rate"),
  flow: t("دبی آب گرم", "Hot water flow"),
  pressure: t("حداکثر فشار کار", "Maximum working pressure"),
  burners: t("تعداد شعله", "Burners"),
  glass: t("ضخامت شیشه", "Glass thickness"),
  grill: t("توان گریل", "Grill power"),
  slots: t("تعداد اسلات", "Slots"),
  browning: t("سطح برشته‌کردن", "Browning levels"),
  diameter: t("قطر پره", "Blade diameter"),
  speeds: t("تعداد دور", "Speeds"),
  ignition: t("نوع جرقه‌زن", "Ignition"),
} satisfies Record<string, LocalizedText>;

const groups = {
  performance: t("عملکرد", "Performance"),
  body: t("ابعاد و وزن", "Size and weight"),
  efficiency: t("مصرف و راندمان", "Consumption and efficiency"),
  safety: t("ایمنی", "Safety"),
} satisfies Record<string, LocalizedText>;

const templateItem = (key: string, itemLabel: LocalizedText, unit: Unit | null) => ({
  key,
  label: itemLabel,
  unit: unit?.label ?? null,
  unitCode: unit?.code ?? null,
});

const energyItem = (energyClass: EnergyClass): LocalizedSpecItem =>
  describe("energyClass", label.energy, t(energyClass, energyClass));

const bodyGroup = (size: readonly number[], weight: number, extra: LocalizedSpecItem[] = []) => ({
  title: groups.body,
  items: [
    {
      ...describe("dimensions", label.dimensions, dimensions(size)),
      unit: units.centimetre.label,
      unitCode: units.centimetre.code,
    },
    measure("weight", label.weight, weight, units.kilogram, { maximumFractionDigits: 1 }),
    ...extra,
  ],
});

interface CoolerSpec {
  airflow: number;
  power: number;
  tank: number;
  area: number;
  size: readonly [number, number, number];
  weight: number;
  noise: number;
  energy: EnergyClass;
}

const coolerSpecs = (spec: CoolerSpec): LocalizedSpecGroup[] => [
  {
    title: groups.performance,
    items: [
      measure("airflow", label.airflow, spec.airflow, units.airflow),
      measure("coverage", label.coverage, spec.area, units.squareMetre),
      measure("tank", label.tank, spec.tank, units.litre),
      measure("noise", label.noise, spec.noise, units.decibel),
    ],
  },
  {
    title: groups.efficiency,
    items: [measure("power", label.power, spec.power, units.watt), energyItem(spec.energy)],
  },
  bodyGroup(spec.size, spec.weight),
];

interface GasHeaterSpec {
  output: number;
  gas: number;
  area: number;
  efficiency: number;
  size: readonly [number, number, number];
  weight: number;
  energy: EnergyClass;
}

const gasHeaterSpecs = (spec: GasHeaterSpec): LocalizedSpecGroup[] => [
  {
    title: groups.performance,
    items: [
      measure("heatOutput", label.heatOutput, spec.output, units.kcalPerHour),
      measure("coverage", label.coverage, spec.area, units.squareMetre),
    ],
  },
  {
    title: groups.efficiency,
    items: [
      measure("gas", label.gas, spec.gas, units.gasFlow, { maximumFractionDigits: 2 }),
      measure("efficiency", label.efficiency, spec.efficiency, units.percent),
      energyItem(spec.energy),
    ],
  },
  {
    title: groups.safety,
    items: [
      describe("ods", t("سنسور کمبود اکسیژن", "Oxygen depletion sensor"), t("دارد", "Yes")),
      describe("thermocouple", t("ترموکوپل", "Thermocouple"), t("دارد", "Yes")),
    ],
  },
  bodyGroup(spec.size, spec.weight),
];

interface ElectricHeaterSpec {
  power: number;
  levels: number;
  area: number;
  size: readonly [number, number, number];
  weight: number;
  energy: EnergyClass;
  fins?: number;
}

const electricHeaterSpecs = (spec: ElectricHeaterSpec): LocalizedSpecGroup[] => [
  {
    title: groups.performance,
    items: [
      measure("power", label.power, spec.power, units.watt),
      measure("levels", label.levels, spec.levels, null),
      measure("coverage", label.coverage, spec.area, units.squareMetre),
      ...(spec.fins ? [measure("fins", label.fins, spec.fins, null)] : []),
    ],
  },
  {
    title: groups.safety,
    items: [
      describe("tipOver", t("قطع خودکار هنگام واژگونی", "Tip-over shut-off"), t("دارد", "Yes")),
      describe("overheat", t("محافظ دمای بیش از حد", "Overheat protection"), t("دارد", "Yes")),
      energyItem(spec.energy),
    ],
  },
  bodyGroup(spec.size, spec.weight),
];

interface WaterHeaterSpec {
  gas: number;
  pressure: number;
  size: readonly [number, number, number];
  weight: number;
  energy: EnergyClass;
  capacity?: number;
  recovery?: number;
  flow?: number;
}

const waterHeaterSpecs = (spec: WaterHeaterSpec): LocalizedSpecGroup[] => [
  {
    title: groups.performance,
    items: [
      ...(spec.capacity ? [measure("capacity", label.capacity, spec.capacity, units.litre)] : []),
      ...(spec.recovery
        ? [measure("recovery", label.recovery, spec.recovery, units.litrePerHour)]
        : []),
      ...(spec.flow ? [measure("flow", label.flow, spec.flow, units.litrePerMinute)] : []),
      measure("pressure", label.pressure, spec.pressure, units.bar),
    ],
  },
  {
    title: groups.efficiency,
    items: [
      measure("gas", label.gas, spec.gas, units.gasFlow, { maximumFractionDigits: 2 }),
      energyItem(spec.energy),
    ],
  },
  {
    title: groups.safety,
    items: [
      describe(
        "reliefValve",
        t("شیر اطمینان دما و فشار", "Temperature and pressure relief valve"),
        t("دارد", "Yes"),
      ),
    ],
  },
  bodyGroup(spec.size, spec.weight),
];

interface FanSpec {
  diameter: number;
  power: number;
  speeds: number;
  airflow: number;
  noise: number;
  size: readonly [number, number, number];
  weight: number;
  energy: EnergyClass;
}

const fanSpecs = (spec: FanSpec): LocalizedSpecGroup[] => [
  {
    title: groups.performance,
    items: [
      measure("diameter", label.diameter, spec.diameter, units.centimetre),
      measure("speeds", label.speeds, spec.speeds, null),
      measure("airflow", label.airflow, spec.airflow, units.airflow),
      measure("noise", label.noise, spec.noise, units.decibel),
    ],
  },
  {
    title: groups.efficiency,
    items: [measure("power", label.power, spec.power, units.watt), energyItem(spec.energy)],
  },
  bodyGroup(spec.size, spec.weight),
];

const feature = (icon: string, title: LocalizedText, body: LocalizedText): LocalizedFeature => ({
  icon,
  title,
  body,
});

const faq = (question: LocalizedText, answer: LocalizedText): LocalizedFaq => ({
  question,
  answer,
});

export const categorySeeds: CategorySeed[] = [
  {
    slug: "evaporative-coolers",
    icon: "air-vent",
    photo: "1681042803902-f79c240d8f03",
    policy: "care",
    name: t("کولر آبی", "Evaporative coolers"),
    summary: t(
      "کولرهای آبی سلولزی با موتور کم‌مصرف برای هوایی خنک و تازه در تابستان‌های گرم و خشک.",
      "Cellulose evaporative coolers with efficient motors for fresh, cool air through hot, dry summers.",
    ),
    description: t(
      "کولرهای آبی ماندگار با پوشال سلولزی، بدنه گالوانیزه و پمپ آب قابل‌تعویض ساخته می‌شوند. این کولرها در اقلیم گرم و خشک، با مصرف برقی بسیار کمتر از کولر گازی، دمای خانه را چند درجه پایین می‌آورند و هوای تازه را جایگزین هوای مانده می‌کنند.",
      "Mandegar evaporative coolers are built with cellulose pads, galvanized bodies and replaceable water pumps. In hot, dry climates they bring indoor temperatures down by several degrees while using far less electricity than an air conditioner, and they keep replacing stale air with fresh air.",
    ),
    specTemplate: [
      {
        title: groups.performance,
        items: [
          templateItem("airflow", label.airflow, units.airflow),
          templateItem("coverage", label.coverage, units.squareMetre),
          templateItem("tank", label.tank, units.litre),
          templateItem("noise", label.noise, units.decibel),
        ],
      },
      {
        title: groups.efficiency,
        items: [
          templateItem("power", label.power, units.watt),
          templateItem("energyClass", label.energy, null),
        ],
      },
      {
        title: groups.body,
        items: [
          templateItem("dimensions", label.dimensions, units.centimetre),
          templateItem("weight", label.weight, units.kilogram),
        ],
      },
    ],
    features: [
      feature(
        "droplets",
        t("پوشال سلولزی سه‌بعدی", "3D cellulose pads"),
        t(
          "پوشال سلولزی ۱۰ سانتی‌متری آب را یکنواخت پخش می‌کند و راندمان خنک‌کنندگی را تا ۳۰ درصد بالا می‌برد.",
          "Ten-centimetre cellulose pads spread water evenly and lift cooling efficiency by up to 30 percent.",
        ),
      ),
      feature(
        "gauge",
        t("موتور دو دور کم‌مصرف", "Two-speed efficient motor"),
        t(
          "موتور با سیم‌پیچ مسی و بلبرینگ آب‌بندی‌شده، بی‌صدا کار می‌کند و به روغن‌کاری فصلی نیاز ندارد.",
          "A copper-wound motor with sealed bearings runs quietly and needs no seasonal oiling.",
        ),
      ),
      feature(
        "shield-check",
        t("بدنه گالوانیزه با رنگ پودری", "Powder-coated galvanized body"),
        t(
          "بدنه در برابر زنگ‌زدگی، رطوبت و تابش مستقیم آفتاب مقاوم است.",
          "The body resists rust, moisture and direct sunlight.",
        ),
      ),
    ],
    faqs: [
      faq(
        t(
          "پوشال کولر را هر چند وقت یک‌بار باید عوض کرد؟",
          "How often should the cooler pads be replaced?",
        ),
        t(
          "پوشال سلولزی معمولاً دو تا سه فصل کار می‌کند. اگر آب منطقه شما سخت است، هر فصل آن را بررسی کنید و در صورت رسوب‌گرفتگی تعویضش کنید.",
          "Cellulose pads usually last two to three seasons. In hard-water areas, check them every season and replace them once scale builds up.",
        ),
      ),
      faq(
        t("این کولر برای چه متراژی مناسب است؟", "What size of home is this cooler suitable for?"),
        t(
          "متراژ پیشنهادی در جدول مشخصات آمده است. برای خانه‌های رو به جنوب یا طبقه آخر، یک مدل بزرگ‌تر انتخاب کنید.",
          "The recommended area is listed in the specifications. For south-facing homes or top-floor flats, choose one size up.",
        ),
      ),
    ],
  },
  {
    slug: "gas-heaters",
    icon: "flame",
    photo: "1547186577-a3f4fa07c2ef",
    policy: "care-plus",
    name: t("بخاری گازی", "Gas heaters"),
    summary: t(
      "بخاری‌های گازی دودکش‌دار با سنسور اکسیژن و ترموکوپل برای گرمایی یکنواخت و ایمن.",
      "Flued gas heaters with an oxygen sensor and thermocouple for even, safe warmth.",
    ),
    description: t(
      "بخاری‌های گازی ماندگار با مشعل راندمان بالا و مبدل حرارتی فولادی، گرما را سریع و یکنواخت در اتاق پخش می‌کنند. همه مدل‌ها به سنسور کمبود اکسیژن، ترموکوپل و کلید اطمینان مجهزند و باید به دودکش استاندارد متصل شوند.",
      "Mandegar gas heaters use high-efficiency burners and steel heat exchangers to spread warmth quickly and evenly. Every model has an oxygen depletion sensor, a thermocouple and a safety cut-off, and must be connected to a standard flue.",
    ),
    specTemplate: [
      {
        title: groups.performance,
        items: [
          templateItem("heatOutput", label.heatOutput, units.kcalPerHour),
          templateItem("coverage", label.coverage, units.squareMetre),
        ],
      },
      {
        title: groups.efficiency,
        items: [
          templateItem("gas", label.gas, units.gasFlow),
          templateItem("efficiency", label.efficiency, units.percent),
          templateItem("energyClass", label.energy, null),
        ],
      },
      {
        title: groups.body,
        items: [
          templateItem("dimensions", label.dimensions, units.centimetre),
          templateItem("weight", label.weight, units.kilogram),
        ],
      },
    ],
    features: [
      feature(
        "shield-alert",
        t("سنسور کمبود اکسیژن", "Oxygen depletion sensor"),
        t(
          "اگر اکسیژن اتاق کم شود، جریان گاز پیش از رسیدن به سطح خطرناک قطع می‌شود.",
          "If the oxygen level in the room drops, the gas supply shuts off well before it becomes dangerous.",
        ),
      ),
      feature(
        "thermometer",
        t("ترموستات چندمرحله‌ای", "Multi-step thermostat"),
        t(
          "دمای دلخواه را تنظیم کنید؛ بخاری شعله را خودکار کم و زیاد می‌کند و گاز کمتری می‌سوزاند.",
          "Set the temperature you want and the heater adjusts the flame on its own, burning less gas.",
        ),
      ),
      feature(
        "flame",
        t("مشعل راندمان بالا", "High-efficiency burner"),
        t(
          "مشعل چدنی با احتراق کامل، دوده و بوی گاز را به حداقل می‌رساند.",
          "A cast-iron burner with complete combustion keeps soot and gas odour to a minimum.",
        ),
      ),
    ],
    faqs: [
      faq(
        t(
          "آیا می‌توان بخاری گازی را بدون دودکش روشن کرد؟",
          "Can a gas heater be used without a flue?",
        ),
        t(
          "خیر. همه بخاری‌های گازی ماندگار باید به دودکش استاندارد متصل شوند. روشن کردن بخاری بدون دودکش خطر مسمومیت با گاز مونوکسید کربن دارد.",
          "No. Every Mandegar gas heater must be connected to a standard flue. Running a heater without one risks carbon monoxide poisoning.",
        ),
      ),
      faq(
        t("این بخاری با گاز مایع هم کار می‌کند؟", "Does this heater work with LPG?"),
        t(
          "مدل‌های استاندارد برای گاز شهری تنظیم شده‌اند. برای استفاده با گاز مایع، نازل مخصوص باید توسط سرویس‌کار مجاز نصب شود.",
          "Standard models are set up for natural gas. To use LPG, an authorized technician must fit the dedicated nozzle.",
        ),
      ),
    ],
  },
  {
    slug: "electric-heaters",
    icon: "heater",
    photo: "1740847262528-a29f09775256",
    policy: "care",
    name: t("بخاری برقی", "Electric heaters"),
    summary: t(
      "فن‌هیتر، رادیاتور روغنی و پنل دیواری برای گرمایش سریع اتاق‌های کوچک و فضاهای بدون گاز.",
      "Fan heaters, oil-filled radiators and wall panels that quickly warm small rooms and spaces without gas.",
    ),
    description: t(
      "بخاری‌های برقی ماندگار برای اتاق خواب، اتاق کار و فضاهایی که لوله‌کشی گاز ندارند طراحی شده‌اند. ترموستات دقیق، قطع خودکار هنگام واژگونی و محافظ دمای بیش از حد، آن‌ها را برای خانه‌های دارای کودک مناسب می‌کند.",
      "Mandegar electric heaters are designed for bedrooms, studies and spaces without gas piping. Precise thermostats, tip-over shut-off and overheat protection make them a good fit for homes with children.",
    ),
    specTemplate: [
      {
        title: groups.performance,
        items: [
          templateItem("power", label.power, units.watt),
          templateItem("levels", label.levels, null),
          templateItem("coverage", label.coverage, units.squareMetre),
        ],
      },
      {
        title: groups.body,
        items: [
          templateItem("dimensions", label.dimensions, units.centimetre),
          templateItem("weight", label.weight, units.kilogram),
        ],
      },
    ],
    features: [
      feature(
        "shield-check",
        t("قطع خودکار هنگام واژگونی", "Tip-over shut-off"),
        t(
          "اگر دستگاه کج شود یا بیفتد، المنت بلافاصله خاموش می‌شود.",
          "If the heater tilts or falls over, the element switches off immediately.",
        ),
      ),
      feature(
        "thermometer",
        t("ترموستات قابل‌تنظیم", "Adjustable thermostat"),
        t(
          "دمای اتاق را ثابت نگه می‌دارد و از مصرف بی‌مورد برق جلوگیری می‌کند.",
          "Keeps the room at a steady temperature and avoids wasting electricity.",
        ),
      ),
      feature(
        "zap",
        t("دو سطح توان", "Two power levels"),
        t(
          "برای گرمایش سریع، توان کامل و برای نگه‌داشتن دما، توان کم را انتخاب کنید.",
          "Use full power to warm up quickly and the low setting to hold the temperature.",
        ),
      ),
    ],
    faqs: [
      faq(
        t("مصرف برق بخاری برقی چقدر است؟", "How much electricity does an electric heater use?"),
        t(
          "یک بخاری ۲۰۰۰ واتی در هر ساعت کار با توان کامل، دو کیلووات‌ساعت برق مصرف می‌کند. ترموستات با خاموش و روشن کردن خودکار، مصرف واقعی را کمتر می‌کند.",
          "A 2,000 W heater uses two kilowatt-hours for every hour at full power. The thermostat cycles the element on and off, so real-world use is lower.",
        ),
      ),
      faq(
        t(
          "می‌توانم بخاری برقی را در حمام استفاده کنم؟",
          "Can I use an electric heater in the bathroom?",
        ),
        t(
          "خیر. بخاری‌های برقی ماندگار برای محیط‌های مرطوب طراحی نشده‌اند و نباید نزدیک وان، دوش یا سینک استفاده شوند.",
          "No. Mandegar electric heaters are not designed for damp rooms and must not be used near a bath, shower or sink.",
        ),
      ),
    ],
  },
  {
    slug: "water-heaters",
    icon: "shower-head",
    photo: "1620653713380-7a34b773fef8",
    policy: "care-plus",
    name: t("آبگرمکن", "Water heaters"),
    summary: t(
      "آبگرمکن‌های دیواری، ایستاده و فوری با مخزن لعابی و شیر اطمینان دما و فشار.",
      "Wall-mounted, floor-standing and instant water heaters with enamel tanks and a temperature-pressure relief valve.",
    ),
    description: t(
      "آبگرمکن‌های ماندگار با مخزن لعابی ضدخوردگی، عایق پلی‌اورتان و میله آند منیزیمی ساخته می‌شوند تا آب گرم پایدار را با مصرف گاز کمتر و عمر طولانی‌تر فراهم کنند. مدل فوری بدون مخزن، آب گرم را تنها در زمان مصرف تولید می‌کند.",
      "Mandegar water heaters use corrosion-resistant enamel tanks, polyurethane insulation and a magnesium anode for steady hot water, lower gas use and a long service life. The tankless instant model heats water only when you need it.",
    ),
    specTemplate: [
      {
        title: groups.performance,
        items: [
          templateItem("capacity", label.capacity, units.litre),
          templateItem("recovery", label.recovery, units.litrePerHour),
          templateItem("pressure", label.pressure, units.bar),
        ],
      },
      {
        title: groups.efficiency,
        items: [
          templateItem("gas", label.gas, units.gasFlow),
          templateItem("energyClass", label.energy, null),
        ],
      },
    ],
    features: [
      feature(
        "shield",
        t("مخزن لعابی ضدخوردگی", "Corrosion-resistant enamel tank"),
        t(
          "لعاب شیشه‌ای دوبار پخته، دیواره مخزن را از زنگ‌زدگی و رسوب محافظت می‌کند.",
          "A double-fired glass enamel lining protects the tank wall from rust and scale.",
        ),
      ),
      feature(
        "layers",
        t("عایق پلی‌اورتان", "Polyurethane insulation"),
        t(
          "عایق تزریقی پنج‌سانتی‌متری، آب را ساعت‌ها گرم نگه می‌دارد و گاز کمتری مصرف می‌شود.",
          "Five centimetres of injected foam keep water hot for hours and cut gas use.",
        ),
      ),
      feature(
        "gauge",
        t("شیر اطمینان دما و فشار", "Temperature and pressure relief valve"),
        t(
          "اگر دما یا فشار مخزن از حد مجاز بالاتر رود، شیر به‌طور خودکار باز می‌شود.",
          "If tank temperature or pressure exceeds the safe limit, the valve opens automatically.",
        ),
      ),
    ],
    faqs: [
      faq(
        t(
          "میله منیزیمی آبگرمکن را کی باید عوض کرد؟",
          "When should the magnesium anode be replaced?",
        ),
        t(
          "میله آند را هر یک تا دو سال بررسی کنید. اگر بیش از نیمی از آن خورده شده باشد، تعویضش عمر مخزن را چند سال بیشتر می‌کند.",
          "Check the anode every one to two years. If more than half of it has worn away, replacing it adds years to the tank's life.",
        ),
      ),
      faq(
        t("برای خانواده چهارنفره چه حجمی مناسب است؟", "What size suits a family of four?"),
        t(
          "برای خانواده سه تا چهار نفره، مخزن ۶۰ تا ۸۰ لیتری کافی است. اگر هم‌زمان از دو حمام استفاده می‌کنید، مدل ۱۵۰ لیتری یا آبگرمکن فوری را انتخاب کنید.",
          "A 60 to 80 litre tank is enough for a family of three or four. If two bathrooms are often in use at once, choose the 150 litre model or an instant heater.",
        ),
      ),
    ],
  },
  {
    slug: "kitchen-appliances",
    icon: "cooking-pot",
    photo: "1556911220-bff31c812dba",
    policy: "care",
    name: t("لوازم آشپزخانه", "Kitchen appliances"),
    summary: t(
      "اجاق گاز، مایکروفر و لوازم کوچک آشپزخانه از ماندگار و برندهای همکار.",
      "Gas hobs, microwaves and small kitchen appliances from Mandegar and partner brands.",
    ),
    description: t(
      "در این دسته، اجاق‌های گاز ماندگار در کنار مایکروفر و لوازم کوچک برندهای همکار عرضه می‌شوند. همه محصولات با گارانتی و قطعات یدکی ماندگار پشتیبانی می‌شوند.",
      "This range brings Mandegar gas hobs together with microwaves and small appliances from partner brands. Every product is backed by Mandegar warranty and spare parts.",
    ),
    specTemplate: [
      {
        title: groups.performance,
        items: [
          templateItem("power", label.power, units.watt),
          templateItem("capacity", label.capacity, units.litre),
        ],
      },
      {
        title: groups.body,
        items: [
          templateItem("dimensions", label.dimensions, units.centimetre),
          templateItem("weight", label.weight, units.kilogram),
        ],
      },
    ],
    features: [],
    faqs: [
      faq(
        t(
          "قطعات یدکی این محصولات از کجا تهیه می‌شود؟",
          "Where can I get spare parts for these products?",
        ),
        t(
          "قطعات اصلی همه محصولات این دسته، از جمله برندهای همکار، از طریق مراکز خدمات مجاز ماندگار در دسترس است.",
          "Genuine parts for every product in this range, including partner brands, are available through Mandegar authorized service centres.",
        ),
      ),
    ],
  },
  {
    slug: "fans",
    icon: "fan",
    photo: "1601084195907-44baaa49dabd",
    policy: "care",
    name: t("پنکه", "Fans"),
    summary: t(
      "پنکه‌های ایستاده، رومیزی و دیواری با موتور مسی و صدای کم.",
      "Stand, desk and wall fans with copper motors and low noise.",
    ),
    description: t(
      "پنکه‌های این دسته با موتور تمام‌مس، پره‌های متعادل‌شده و گردش افقی، جریان هوای آرامی را در تمام اتاق پخش می‌کنند. برای شب‌های تابستان و فضاهایی که کولر ندارند، انتخابی کم‌مصرف هستند.",
      "These fans pair all-copper motors with balanced blades and oscillation to spread a gentle breeze across the room. They are a low-power choice for summer nights and rooms without a cooler.",
    ),
    specTemplate: [
      {
        title: groups.performance,
        items: [
          templateItem("diameter", label.diameter, units.centimetre),
          templateItem("speeds", label.speeds, null),
          templateItem("airflow", label.airflow, units.airflow),
          templateItem("noise", label.noise, units.decibel),
        ],
      },
      {
        title: groups.efficiency,
        items: [
          templateItem("power", label.power, units.watt),
          templateItem("energyClass", label.energy, null),
        ],
      },
    ],
    features: [
      feature(
        "fan",
        t("موتور تمام‌مس", "All-copper motor"),
        t(
          "سیم‌پیچ مسی کمتر داغ می‌شود و سال‌ها بدون افت دور کار می‌کند.",
          "Copper windings run cooler and keep their speed for years.",
        ),
      ),
      feature(
        "refresh-cw",
        t("گردش افقی ۹۰ درجه", "90° oscillation"),
        t(
          "هوا را در کل اتاق پخش می‌کند، نه فقط در یک نقطه.",
          "Spreads air across the whole room instead of one spot.",
        ),
      ),
      feature(
        "volume-1",
        t("کارکرد کم‌صدا", "Quiet running"),
        t(
          "پره‌های متعادل‌شده و بلبرینگ دقیق، صدای پنکه را برای خواب شبانه پایین نگه می‌دارند.",
          "Balanced blades and precision bearings keep noise low enough for sleeping.",
        ),
      ),
    ],
    faqs: [
      faq(
        t("پنکه را چطور تمیز کنم؟", "How do I clean the fan?"),
        t(
          "دوشاخه را از برق بکشید، توری جلو را باز کنید و پره‌ها را با پارچه نم‌دار بشویید. پیش از بستن دوباره، صبر کنید کاملاً خشک شوند.",
          "Unplug the fan, remove the front guard and wipe the blades with a damp cloth. Let everything dry completely before reassembling.",
        ),
      ),
    ],
  },
];

const hobFeatures = [
  feature(
    "flame",
    t("ترموکوپل روی همه شعله‌ها", "Thermocouple on every burner"),
    t(
      "اگر شعله خاموش شود، گاز همان شعله در چند ثانیه قطع می‌شود.",
      "If a flame goes out, gas to that burner shuts off within seconds.",
    ),
  ),
  feature(
    "zap",
    t("جرقه‌زن اتوماتیک", "Automatic ignition"),
    t(
      "با فشار و چرخاندن پیچ، شعله بدون فندک روشن می‌شود.",
      "Push and turn a knob to light the burner without a lighter.",
    ),
  ),
  feature(
    "sparkles",
    t("شیشه نشکن ۸ میلی‌متری", "8 mm toughened glass"),
    t(
      "سطح شیشه‌ای در برابر ضربه و حرارت مقاوم است و راحت تمیز می‌شود.",
      "The glass top resists knocks and heat and wipes clean easily.",
    ),
  ),
];

const microwaveFeatures = [
  feature(
    "microwave",
    t("پخت ترکیبی", "Combination cooking"),
    t(
      "مایکروویو و گریل را هم‌زمان به کار بگیرید تا غذا هم سریع بپزد و هم برشته شود.",
      "Run microwave and grill together so food cooks fast and still browns.",
    ),
  ),
  feature(
    "timer",
    t("۸ برنامه پخت آماده", "8 auto-cook programmes"),
    t(
      "برای گرم کردن، یخ‌زدایی و پخت غذاهای روزمره، فقط یک دکمه را بزنید.",
      "Reheat, defrost or cook everyday dishes at the press of a button.",
    ),
  ),
];

const toasterFeatures = [
  feature(
    "sliders-horizontal",
    t("۷ سطح برشته‌کردن", "Seven browning levels"),
    t(
      "از نان کمی گرم تا تُست کاملاً طلایی را تنظیم کنید.",
      "Choose anything from lightly warmed to deep golden toast.",
    ),
  ),
  feature(
    "power",
    t("دکمه یخ‌زدایی و لغو", "Defrost and cancel buttons"),
    t(
      "نان یخ‌زده را مستقیم برشته کنید یا هر زمان کار را متوقف کنید.",
      "Toast straight from frozen or stop at any time.",
    ),
  ),
];

const appliance = (
  power: number,
  extras: LocalizedSpecItem[],
  size: readonly [number, number, number],
  weight: number,
): LocalizedSpecGroup[] => [
  {
    title: groups.performance,
    items: [measure("power", label.power, power, units.watt), ...extras],
  },
  bodyGroup(size, weight),
];

const product = (
  seed: Omit<ProductSeed, "features"> & { features?: LocalizedFeature[] },
): ProductSeed => ({
  ...seed,
  features:
    seed.features ??
    categorySeeds.find((category) => category.slug === seed.category)?.features ??
    [],
});

export const productSeeds: ProductSeed[] = [
  product({
    slug: "mc-3500",
    modelCode: "MC-3500",
    category: "evaporative-coolers",
    brand: "mandegar",
    featured: false,
    isNew: false,
    releaseYear: 2022,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("کولر آبی سلولزی MC-3500", "MC-3500 Cellulose Evaporative Cooler"),
    tagline: t(
      "جمع‌وجور و کم‌مصرف برای آپارتمان‌های کوچک",
      "Compact and efficient for small apartments",
    ),
    summary: t(
      "کولر آبی ۳۵۰۰ با پوشال سلولزی و موتور دو دور، برای آپارتمان‌های تا ۶۰ متر مربع و بالکن‌های کم‌جا.",
      "A 3,500 m³/h cooler with cellulose pads and a two-speed motor for flats up to 60 m² and tight balconies.",
    ),
    highlights: [
      t(
        "ابعاد جمع‌وجور برای نصب روی بالکن یا پنجره",
        "Compact enough for a balcony or window mount",
      ),
      t("مصرف برق ۲۲۰ وات در دور تند", "220 W at high speed"),
    ],
    specs: coolerSpecs({
      airflow: 3500,
      power: 220,
      tank: 30,
      area: 60,
      size: [76, 76, 90],
      weight: 29,
      noise: 56,
      energy: "A",
    }),
    photos: ["1757219525975-03b5984bc6e8", "1762341123870-d706f257a12e"],
  }),
  product({
    slug: "mc-4500",
    modelCode: "MC-4500",
    category: "evaporative-coolers",
    brand: "mandegar",
    featured: true,
    isNew: false,
    releaseYear: 2023,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("کولر آبی سلولزی MC-4500", "MC-4500 Cellulose Evaporative Cooler"),
    tagline: t("پرفروش‌ترین مدل برای خانه‌های متوسط", "Our best-seller for mid-sized homes"),
    summary: t(
      "کولر آبی ۴۵۰۰ با پوشال سلولزی سه‌بعدی، پمپ قابل‌تعویض و بدنه گالوانیزه؛ مناسب خانه‌های تا ۹۰ متر مربع.",
      "A 4,500 m³/h cooler with 3D cellulose pads, a replaceable pump and a galvanized body, sized for homes up to 90 m².",
    ),
    highlights: [
      t("هوادهی ۴۵۰۰ متر مکعب بر ساعت", "4,500 m³/h of airflow"),
      t("مخزن ۳۸ لیتری با شناور برنجی", "38 litre tank with a brass float valve"),
    ],
    specs: coolerSpecs({
      airflow: 4500,
      power: 280,
      tank: 38,
      area: 90,
      size: [86, 86, 100],
      weight: 36,
      noise: 58,
      energy: "A",
    }),
    photos: ["1681042803902-f79c240d8f03", "1718203862467-c33159fdc504"],
  }),
  product({
    slug: "mc-7000",
    modelCode: "MC-7000",
    category: "evaporative-coolers",
    brand: "mandegar",
    featured: false,
    isNew: true,
    releaseYear: 2025,
    energyClass: "B",
    warrantyMonths: 18,
    name: t("کولر آبی پرقدرت MC-7000", "MC-7000 Heavy-Duty Evaporative Cooler"),
    tagline: t(
      "هوادهی بالا برای ویلا، مغازه و کارگاه",
      "High airflow for villas, shops and workshops",
    ),
    summary: t(
      "کولر آبی ۷۰۰۰ با موتور تقویت‌شده و پوشال ۱۵ سانتی‌متری برای فضاهای باز تا ۱۵۰ متر مربع.",
      "A 7,000 m³/h cooler with an uprated motor and 15 cm pads for open spaces up to 150 m².",
    ),
    highlights: [
      t("پوشال ۱۵ سانتی‌متری برای خنک‌کنندگی بیشتر", "15 cm pads for deeper cooling"),
      t("مناسب نصب روی پشت‌بام و دیوار", "Suits roof or wall installation"),
    ],
    specs: coolerSpecs({
      airflow: 7000,
      power: 550,
      tank: 55,
      area: 150,
      size: [110, 110, 120],
      weight: 58,
      noise: 63,
      energy: "B",
    }),
    photos: ["1665826254141-bfa10685e002", "1681042803902-f79c240d8f03"],
  }),
  product({
    slug: "mgh-9000",
    modelCode: "MGH-9000",
    category: "gas-heaters",
    brand: "mandegar",
    featured: true,
    isNew: false,
    releaseYear: 2023,
    energyClass: "B",
    warrantyMonths: 30,
    name: t("بخاری گازی دودکش‌دار MGH-9000", "MGH-9000 Flued Gas Heater"),
    tagline: t("گرمای یکنواخت با سنسور اکسیژن", "Even warmth with an oxygen sensor"),
    summary: t(
      "بخاری گازی ۹۰۰۰ کیلوکالری با ترموستات چندمرحله‌ای و سنسور کمبود اکسیژن، برای پذیرایی‌های تا ۷۰ متر مربع.",
      "A 9,000 kcal/h gas heater with a multi-step thermostat and oxygen depletion sensor, for living rooms up to 70 m².",
    ),
    highlights: [
      t("راندمان حرارتی ۸۸ درصد", "88 percent thermal efficiency"),
      t("ترموکوپل و کلید اطمینان", "Thermocouple and safety cut-off"),
    ],
    specs: gasHeaterSpecs({
      output: 9000,
      gas: 1,
      area: 70,
      efficiency: 88,
      size: [75, 30, 60],
      weight: 22,
      energy: "B",
    }),
    photos: ["1547186577-a3f4fa07c2ef", "1728509741559-44172bcd86b3"],
  }),
  product({
    slug: "mgh-12000",
    modelCode: "MGH-12000",
    category: "gas-heaters",
    brand: "mandegar",
    featured: false,
    isNew: false,
    releaseYear: 2022,
    energyClass: "B",
    warrantyMonths: 30,
    name: t("بخاری گازی دودکش‌دار MGH-12000", "MGH-12000 Flued Gas Heater"),
    tagline: t("برای پذیرایی‌های بزرگ و سقف بلند", "For large living rooms and high ceilings"),
    summary: t(
      "بخاری گازی ۱۲۰۰۰ کیلوکالری با مبدل حرارتی فولادی و فن کمکی، برای فضاهای تا ۱۰۰ متر مربع.",
      "A 12,000 kcal/h gas heater with a steel heat exchanger and assist fan, for spaces up to 100 m².",
    ),
    highlights: [
      t("فن کمکی برای پخش سریع گرما", "Assist fan spreads heat faster"),
      t("راندمان حرارتی ۸۹ درصد", "89 percent thermal efficiency"),
    ],
    specs: gasHeaterSpecs({
      output: 12000,
      gas: 1.35,
      area: 100,
      efficiency: 89,
      size: [85, 32, 65],
      weight: 27,
      energy: "B",
    }),
    photos: ["1633596879450-e98a1a4d0c80", "1595166986545-bf6dacb22b4e"],
  }),
  product({
    slug: "ah-8000",
    modelCode: "AH-8000",
    category: "gas-heaters",
    brand: "aras-home",
    featured: false,
    isNew: false,
    releaseYear: 2024,
    energyClass: "C",
    warrantyMonths: 30,
    name: t("بخاری گازی شومینه‌ای آراس هوم AH-8000", "Aras Home AH-8000 Fireplace Gas Heater"),
    tagline: t("طراحی شومینه‌ای با شعله نمایان", "Fireplace styling with a visible flame"),
    summary: t(
      "بخاری گازی ۸۰۰۰ کیلوکالری با نمای شومینه و شیشه نسوز، برای پذیرایی‌های تا ۶۰ متر مربع.",
      "An 8,000 kcal/h gas heater with a fireplace front and heat-resistant glass, for living rooms up to 60 m².",
    ),
    highlights: [
      t("شیشه نسوز با نمای شعله", "Heat-resistant glass flame view"),
      t("سنسور کمبود اکسیژن", "Oxygen depletion sensor"),
    ],
    specs: gasHeaterSpecs({
      output: 8000,
      gas: 0.95,
      area: 60,
      efficiency: 86,
      size: [70, 28, 80],
      weight: 25,
      energy: "C",
    }),
    photos: ["1698933787134-af2d451985c7", "1547186577-a3f4fa07c2ef"],
  }),
  product({
    slug: "meh-2000",
    modelCode: "MEH-2000",
    category: "electric-heaters",
    brand: "mandegar",
    featured: false,
    isNew: true,
    releaseYear: 2025,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("فن‌هیتر MEH-2000", "MEH-2000 Fan Heater"),
    tagline: t("گرمای فوری برای اتاق کار و خواب", "Instant warmth for studies and bedrooms"),
    summary: t(
      "فن‌هیتر ۲۰۰۰ وات با المنت سرامیکی، دو سطح توان و قطع خودکار هنگام واژگونی.",
      "A 2,000 W fan heater with a ceramic element, two power levels and tip-over shut-off.",
    ),
    highlights: [
      t("المنت سرامیکی PTC", "Ceramic PTC element"),
      t("وزن کمتر از ۲٫۵ کیلوگرم", "Weighs under 2.5 kg"),
    ],
    specs: electricHeaterSpecs({
      power: 2000,
      levels: 2,
      area: 20,
      size: [25, 15, 30],
      weight: 2.1,
      energy: "A",
    }),
    photos: ["1740847262528-a29f09775256"],
  }),
  product({
    slug: "mor-2500",
    modelCode: "MOR-2500",
    category: "electric-heaters",
    brand: "mandegar",
    featured: false,
    isNew: false,
    releaseYear: 2023,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("رادیاتور برقی روغنی MOR-2500", "MOR-2500 Oil-Filled Radiator"),
    tagline: t("گرمای آرام و بی‌صدا با ۱۱ پره", "Quiet, gentle heat with 11 fins"),
    summary: t(
      "رادیاتور روغنی ۲۵۰۰ وات با ۱۱ پره، سه سطح توان و چرخ‌های جابه‌جایی، برای اتاق‌های تا ۲۵ متر مربع.",
      "A 2,500 W oil-filled radiator with 11 fins, three power levels and castor wheels, for rooms up to 25 m².",
    ),
    highlights: [
      t("کاملاً بی‌صدا، بدون فن", "Silent, with no fan"),
      t("گرمای ماندگار حتی پس از خاموشی", "Keeps radiating after switch-off"),
    ],
    specs: electricHeaterSpecs({
      power: 2500,
      levels: 3,
      area: 25,
      size: [63, 25, 65],
      weight: 12.5,
      energy: "A",
      fins: 11,
    }),
    photos: ["1599028274511-e02a767949a3", "1669722820990-2801092c0986"],
  }),
  product({
    slug: "ne-1800",
    modelCode: "NE-1800",
    category: "electric-heaters",
    brand: "nikan-electric",
    featured: false,
    isNew: false,
    releaseYear: 2024,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("پنل گرمایشی نیکان NE-1800", "Nikan NE-1800 Panel Heater"),
    tagline: t("پنل دیواری باریک با ترموستات دیجیتال", "Slim wall panel with a digital thermostat"),
    summary: t(
      "پنل گرمایشی ۱۸۰۰ وات با ضخامت ۹ سانتی‌متر، ترموستات دیجیتال و تایمر هفتگی.",
      "An 1,800 W wall panel just 9 cm deep, with a digital thermostat and weekly timer.",
    ),
    highlights: [
      t("ضخامت تنها ۹ سانتی‌متر", "Only 9 cm deep"),
      t("تایمر هفتگی قابل‌برنامه‌ریزی", "Programmable weekly timer"),
    ],
    specs: electricHeaterSpecs({
      power: 1800,
      levels: 2,
      area: 18,
      size: [80, 9, 45],
      weight: 6.5,
      energy: "A",
    }),
    photos: ["1669725341213-7379ff6c90d5"],
  }),
  product({
    slug: "mwh-60",
    modelCode: "MWH-60",
    category: "water-heaters",
    brand: "mandegar",
    featured: false,
    isNew: false,
    releaseYear: 2022,
    energyClass: "B",
    warrantyMonths: 30,
    name: t("آبگرمکن دیواری گازی MWH-60", "MWH-60 Wall-Mounted Gas Water Heater"),
    tagline: t("مخزن ۶۰ لیتری برای آپارتمان‌های کوچک", "60 litre tank for small apartments"),
    summary: t(
      "آبگرمکن دیواری ۶۰ لیتری با مخزن لعابی و شیر اطمینان، مناسب خانواده‌های دو تا سه نفره.",
      "A 60 litre wall-mounted water heater with an enamel tank and relief valve, suited to households of two or three.",
    ),
    highlights: [
      t("نصب دیواری و صرفه‌جویی در فضا", "Wall-mounted to save floor space"),
      t("میله آند منیزیمی قابل‌تعویض", "Replaceable magnesium anode"),
    ],
    specs: waterHeaterSpecs({
      capacity: 60,
      recovery: 120,
      gas: 0.45,
      pressure: 7,
      size: [45, 45, 95],
      weight: 28,
      energy: "B",
    }),
    photos: ["1594233078955-e1f73a02ebb2"],
  }),
  product({
    slug: "mwh-150",
    modelCode: "MWH-150",
    category: "water-heaters",
    brand: "mandegar",
    featured: true,
    isNew: false,
    releaseYear: 2023,
    energyClass: "B",
    warrantyMonths: 30,
    name: t("آبگرمکن ایستاده گازی MWH-150", "MWH-150 Floor-Standing Gas Water Heater"),
    tagline: t("آب گرم پایدار برای خانواده‌های پرجمعیت", "Steady hot water for larger families"),
    summary: t(
      "آبگرمکن ایستاده ۱۵۰ لیتری با عایق پلی‌اورتان و سرعت گرمایش ۲۵۰ لیتر در ساعت، برای خانه‌های دو حمامه.",
      "A 150 litre floor-standing water heater with polyurethane insulation and 250 L/h recovery, for homes with two bathrooms.",
    ),
    highlights: [
      t("سرعت گرمایش ۲۵۰ لیتر در ساعت", "250 L/h recovery rate"),
      t("عایق پلی‌اورتان پنج‌سانتی‌متری", "5 cm polyurethane insulation"),
    ],
    specs: waterHeaterSpecs({
      capacity: 150,
      recovery: 250,
      gas: 0.8,
      pressure: 8,
      size: [55, 55, 150],
      weight: 52,
      energy: "B",
    }),
    photos: ["1620653713380-7a34b773fef8", "1607472586893-edb57bdc0e39"],
  }),
  product({
    slug: "miw-12",
    modelCode: "MIW-12",
    category: "water-heaters",
    brand: "mandegar",
    featured: false,
    isNew: true,
    releaseYear: 2025,
    energyClass: "A",
    warrantyMonths: 30,
    name: t("آبگرمکن فوری گازی MIW-12", "MIW-12 Instant Gas Water Heater"),
    tagline: t("آب گرم بی‌وقفه بدون مخزن", "Endless hot water without a tank"),
    summary: t(
      "آبگرمکن فوری با دبی ۱۲ لیتر در دقیقه که آب را فقط هنگام باز شدن شیر گرم می‌کند.",
      "An instant water heater delivering 12 litres a minute, heating water only when a tap is open.",
    ),
    highlights: [
      t("بدون اتلاف حرارت مخزن", "No standing tank losses"),
      t("نمایشگر دیجیتال دمای آب", "Digital water temperature display"),
    ],
    specs: waterHeaterSpecs({
      flow: 12,
      gas: 2.4,
      pressure: 10,
      size: [33, 18, 58],
      weight: 11,
      energy: "A",
    }),
    photos: ["1607472586893-edb57bdc0e39", "1594233078955-e1f73a02ebb2"],
  }),
  product({
    slug: "mgs-5",
    modelCode: "MGS-5",
    category: "kitchen-appliances",
    brand: "mandegar",
    featured: true,
    isNew: false,
    releaseYear: 2024,
    energyClass: null,
    warrantyMonths: 18,
    name: t("اجاق گاز رومیزی پنج‌شعله MGS-5", "MGS-5 Five-Burner Gas Hob"),
    tagline: t(
      "شیشه نشکن با ترموکوپل روی همه شعله‌ها",
      "Toughened glass with a thermocouple on every burner",
    ),
    summary: t(
      "اجاق گاز رومیزی ۹۰ سانتی‌متری با پنج شعله، شیشه نشکن ۸ میلی‌متری و جرقه‌زن اتوماتیک.",
      "A 90 cm five-burner gas hob with 8 mm toughened glass and automatic ignition.",
    ),
    highlights: [
      t("شعله مرکزی سه‌حلقه برای قابلمه‌های بزرگ", "Triple-ring centre burner for large pots"),
      t("ترموکوپل روی هر پنج شعله", "Thermocouple on all five burners"),
    ],
    specs: [
      {
        title: groups.performance,
        items: [
          measure("burners", label.burners, 5, null),
          measure("glass", label.glass, 8, units.millimetre),
          describe("ignition", label.ignition, t("اتوماتیک زیر پیچ", "Integrated in knobs")),
        ],
      },
      bodyGroup([90, 52, 10], 16),
    ],
    features: hobFeatures,
    photos: ["1608454770647-01dc0f7dd97d", "1608454781855-613047b52c94"],
  }),
  product({
    slug: "gmw-28",
    modelCode: "GMW-28",
    category: "kitchen-appliances",
    brand: "general",
    featured: false,
    isNew: false,
    releaseYear: 2024,
    energyClass: null,
    warrantyMonths: 18,
    name: t("مایکروفر جنرال GMW-28", "General GMW-28 Microwave Oven"),
    tagline: t("۲۸ لیتر با گریل و پخت ترکیبی", "28 litres with grill and combination cooking"),
    summary: t(
      "مایکروفر ۲۸ لیتری با توان ۹۰۰ وات، گریل ۱۰۰۰ وات و هشت برنامه پخت آماده.",
      "A 28 litre microwave with 900 W of microwave power, a 1,000 W grill and eight auto-cook programmes.",
    ),
    highlights: [t("بشقاب گردان ۳۱ سانتی‌متری", "31 cm turntable"), t("قفل کودک", "Child lock")],
    specs: appliance(
      900,
      [
        measure("capacity", label.capacity, 28, units.litre),
        measure("grill", label.grill, 1000, units.watt),
      ],
      [51, 42, 30],
      15,
    ),
    features: microwaveFeatures,
    photos: ["1596552183299-000ef779e88d", "1722942722302-3e8a6dd7e77c"],
  }),
  product({
    slug: "gt-2s",
    modelCode: "GT-2S",
    category: "kitchen-appliances",
    brand: "general",
    featured: false,
    isNew: false,
    releaseYear: 2023,
    energyClass: null,
    warrantyMonths: 12,
    name: t("توستر جنرال GT-2S", "General GT-2S Toaster"),
    tagline: t("دو اسلات پهن با ۷ سطح برشته‌کردن", "Two wide slots and seven browning levels"),
    summary: t(
      "توستر ۹۰۰ وات با دو اسلات پهن برای نان‌های سنتی و تُست، همراه با سینی خرده‌نان جداشونده.",
      "A 900 W toaster with two wide slots for traditional breads and toast, plus a removable crumb tray.",
    ),
    highlights: [
      t("اسلات پهن برای نان بربری و تافتون", "Wide slots for barbari and taftoon bread"),
      t("سینی خرده‌نان جداشونده", "Removable crumb tray"),
    ],
    specs: appliance(
      900,
      [measure("slots", label.slots, 2, null), measure("browning", label.browning, 7, null)],
      [30, 18, 19],
      1.6,
    ),
    features: toasterFeatures,
    photos: ["1618506408870-64d8bec48248", "1570222094114-d054a817e56b"],
  }),
  product({
    slug: "msf-40",
    modelCode: "MSF-40",
    category: "fans",
    brand: "mandegar",
    featured: true,
    isNew: true,
    releaseYear: 2025,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("پنکه ایستاده MSF-40", "MSF-40 Stand Fan"),
    tagline: t("پنج پره، سه دور و تایمر", "Five blades, three speeds and a timer"),
    summary: t(
      "پنکه ایستاده با پره ۴۰ سانتی‌متری، موتور تمام‌مس، تایمر ۷ ساعته و ارتفاع قابل‌تنظیم.",
      "A stand fan with 40 cm blades, an all-copper motor, a 7-hour timer and adjustable height.",
    ),
    highlights: [
      t("ارتفاع قابل‌تنظیم از ۱۱۰ تا ۱۳۵ سانتی‌متر", "Height adjusts from 110 to 135 cm"),
      t("تایمر خاموشی ۷ ساعته", "7-hour off timer"),
    ],
    specs: fanSpecs({
      diameter: 40,
      power: 55,
      speeds: 3,
      airflow: 3600,
      noise: 50,
      size: [45, 45, 135],
      weight: 5.2,
      energy: "A",
    }),
    photos: ["1607835498554-2c5519af1730", "1658304830982-8a515f340877"],
  }),
  product({
    slug: "mdf-25",
    modelCode: "MDF-25",
    category: "fans",
    brand: "mandegar",
    featured: false,
    isNew: false,
    releaseYear: 2022,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("پنکه رومیزی MDF-25", "MDF-25 Desk Fan"),
    tagline: t("کوچک، کم‌صدا و چرخشی", "Small, quiet and oscillating"),
    summary: t(
      "پنکه رومیزی با پره ۲۵ سانتی‌متری و دو دور، برای میز کار، آشپزخانه و اتاق کودک.",
      "A desk fan with 25 cm blades and two speeds, for the desk, kitchen or nursery.",
    ),
    highlights: [
      t("صدای ۴۲ دسی‌بل در دور کند", "42 dB at low speed"),
      t("مصرف تنها ۳۰ وات", "Uses just 30 W"),
    ],
    specs: fanSpecs({
      diameter: 25,
      power: 30,
      speeds: 2,
      airflow: 1200,
      noise: 42,
      size: [30, 22, 40],
      weight: 1.9,
      energy: "A",
    }),
    photos: ["1565151443833-29bf2ba5dd8d", "1568392816241-44d223d4d490"],
  }),
  product({
    slug: "gwf-40",
    modelCode: "GWF-40",
    category: "fans",
    brand: "general",
    featured: false,
    isNew: false,
    releaseYear: 2024,
    energyClass: "A",
    warrantyMonths: 18,
    name: t("پنکه دیواری جنرال GWF-40", "General GWF-40 Wall Fan"),
    tagline: t("نصب روی دیوار با کنترل از راه دور", "Wall-mounted with a remote control"),
    summary: t(
      "پنکه دیواری با پره ۴۰ سانتی‌متری، کنترل از راه دور و سه حالت باد، برای فضاهایی که جای پنکه ایستاده ندارند.",
      "A wall fan with 40 cm blades, a remote control and three breeze modes, for rooms with no space for a stand fan.",
    ),
    highlights: [
      t("کنترل از راه دور", "Remote control"),
      t("سه حالت باد: معمولی، طبیعی و خواب", "Three modes: normal, natural and sleep"),
    ],
    specs: fanSpecs({
      diameter: 40,
      power: 50,
      speeds: 3,
      airflow: 3300,
      noise: 52,
      size: [48, 30, 55],
      weight: 3.8,
      energy: "A",
    }),
    photos: ["1618941716939-553df3c6c278", "1612549672719-2f1a3908ae31"],
  }),
];

export const keyFactsOf = (seed: ProductSeed) =>
  seed.specs
    .flatMap((group) => group.items)
    .filter((item) => item.numeric !== null)
    .slice(0, 3)
    .map((item) => ({
      label: item.label,
      value: item.unit
        ? t(`${item.value.fa} ${item.unit.fa}`, `${item.value.en} ${item.unit.en}`)
        : item.value,
    }));

export const descriptionOf = (seed: ProductSeed, category: CategorySeed) =>
  t(
    [
      seed.summary.fa,
      "",
      "### ویژگی‌های برجسته",
      ...seed.highlights.map((highlight) => `- ${highlight.fa}`),
      "",
      "### درباره این دسته",
      category.description.fa,
      "",
      "### نصب و گارانتی",
      `نصب ${seed.name.fa} باید توسط نماینده یا سرویس‌کار مجاز ماندگار انجام شود. کد گارانتی روی برچسب دستگاه را در صفحه استعلام گارانتی وارد کنید تا اصالت کالا و مدت پوشش (${amount(seed.warrantyMonths).fa} ماه) را ببینید.`,
    ].join("\n"),
    [
      seed.summary.en,
      "",
      "### Highlights",
      ...seed.highlights.map((highlight) => `- ${highlight.en}`),
      "",
      "### About this range",
      category.description.en,
      "",
      "### Installation and warranty",
      `The ${seed.name.en} should be installed by an authorized Mandegar dealer or technician. Enter the warranty code from the rating label on the warranty check page to confirm the product is genuine and see its ${seed.warrantyMonths}-month coverage.`,
    ].join("\n"),
  );
