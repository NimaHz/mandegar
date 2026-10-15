import type { Locale } from "@/i18n/config";

import type { GlossarySlug } from "./config";

interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface GlossaryContent {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  alphabet: string[];
  jumpLabel: string;
  termCount: string;
  related: string;
  copyLink: string;
  pages: Record<"warranty" | "compare", string>;
  terms: Record<GlossarySlug, GlossaryEntry>;
}

export const glossaryContent: Record<Locale, GlossaryContent> = {
  fa: {
    metaTitle: "واژه‌نامه لوازم خانگی",
    metaDescription:
      "معنای ساده اصطلاح‌های فنی کولر، بخاری و آبگرمکن؛ از پوشال سلولزی و هوادهی تا میله آند و شیر اطمینان.",
    eyebrow: "واژه‌نامه",
    title: "زبان فنی لوازم خانگی، ساده",
    description:
      "اصطلاح‌هایی که در کاتالوگ، برچسب دستگاه و راهنمای نصب می‌بینی، کوتاه و بی‌پیچ‌وتاب توضیح داده شده‌اند.",
    alphabet: [..."ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی"],
    jumpLabel: "رفتن به حرف",
    termCount: "{count} اصطلاح",
    related: "بیشتر بدانید",
    copyLink: "پیوند مستقیم به {term}",
    pages: {
      warranty: "استعلام گارانتی",
      compare: "مقایسه مدل‌ها",
    },
    terms: {
      "evaporative-cooling": {
        term: "سرمایش تبخیری",
        definition:
          "خنک‌کردن هوا با تبخیر آب. هوای گرم از پوشال خیس عبور می‌کند، بخشی از آب بخار می‌شود و دمای هوا پایین می‌آید. در اقلیم خشک بهترین بازده را دارد.",
      },
      "cellulose-pad": {
        term: "پوشال سلولزی",
        definition:
          "پد لانه‌زنبوری از کاغذ سلولزی که جای پوشال چوبی را در کولر گرفته است. سطح تماس بیشتری با آب دارد، دیرتر رسوب می‌گیرد و چند فصل کار می‌کند.",
      },
      airflow: {
        term: "هوادهی (متر مکعب بر ساعت)",
        definition:
          "حجم هوایی که دستگاه در یک ساعت جابه‌جا می‌کند. برای کولر آبی، حجم خانه را در ۲۰ ضرب کن تا هوادهی لازم به دست آید.",
      },
      "float-valve": {
        term: "شناور",
        definition:
          "شیری که با بالا آمدن سطح آب در تشتک کولر بسته می‌شود و جلوی سرریز را می‌گیرد. شناور تنظیم‌نشده یعنی هدر رفتن آب یا خشک ماندن پمپ.",
      },
      "cooler-pump": {
        term: "پمپ آب کولر",
        definition:
          "پمپ کوچکی که آب تشتک را به بالای پوشال‌ها می‌رساند. اگر پوشال‌ها خشک می‌مانند، اول پمپ و مسیر آب را بررسی کن.",
      },
      "blower-belt": {
        term: "پروانه و تسمه",
        definition:
          "پروانه هوا را از پوشال‌ها می‌کشد و به خانه می‌دمد و تسمه نیروی موتور را به آن می‌رساند. تسمه شل یا ترک‌خورده، هوادهی را کم و صدا را زیاد می‌کند.",
      },
      "bldc-motor": {
        term: "موتور BLDC",
        definition:
          "موتور الکتریکی بدون جاروبک با کنترل الکترونیکی. نسبت به موتورهای معمولی کم‌مصرف‌تر، کم‌صداتر و بادوام‌تر است و سرعتش دقیق‌تر تنظیم می‌شود.",
      },
      inverter: {
        term: "اینورتر",
        definition:
          "مداری که به‌جای خاموش و روشن کردن مداوم، توان دستگاه را به‌تدریج کم و زیاد می‌کند. نتیجه، مصرف برق کمتر و کارکرد یکنواخت‌تر است.",
      },
      "energy-class": {
        term: "رده انرژی",
        definition:
          "رتبه مصرف انرژی دستگاه روی برچسب انرژی، از A (کم‌مصرف‌ترین) تا G. هرچه رده بهتر باشد، قبض برق در طول عمر دستگاه کمتر است.",
      },
      thermostat: {
        term: "ترموستات",
        definition:
          "حسگری که دما را می‌سنجد و دستگاه را در دمای تنظیم‌شده خاموش یا روشن می‌کند تا دما ثابت بماند و انرژی هدر نرود.",
      },
      "heating-capacity": {
        term: "ظرفیت گرمایی",
        definition:
          "مقدار گرمایی که بخاری در یک ساعت تولید می‌کند، بر حسب کیلوکالری بر ساعت یا کیلووات. ظرفیت مناسب به متراژ، عایق‌بندی و اقلیم بستگی دارد.",
      },
      flue: {
        term: "دودکش",
        definition:
          "مسیر خروج گازهای حاصل از سوختن به بیرون ساختمان. دودکش باز و استاندارد، مهم‌ترین شرط ایمنی بخاری و آبگرمکن گازی است.",
      },
      "h-cowl": {
        term: "کلاهک H",
        definition:
          "کلاهکی به شکل حرف H که روی دودکش در پشت‌بام نصب می‌شود و نمی‌گذارد باد، دود را به داخل خانه برگرداند.",
      },
      "pilot-light": {
        term: "شمعک",
        definition:
          "شعله کوچک و همیشه روشنی که مشعل اصلی بخاری یا آبگرمکن را روشن می‌کند. شعله شمعک باید آبی و پایدار باشد.",
      },
      thermocouple: {
        term: "ترموکوپل",
        definition:
          "حسگر حرارتی کنار شمعک. اگر شعله خاموش شود، ترموکوپل سرد می‌شود و شیر گاز را می‌بندد تا گاز نشت نکند.",
      },
      "oxygen-sensor": {
        term: "حسگر کمبود اکسیژن",
        definition:
          "سامانه‌ای که با کم شدن اکسیژن هوای اتاق، بخاری را خاموش می‌کند. یک لایه حفاظتی مهم در برابر گازگرفتگی است.",
      },
      "safety-valve": {
        term: "شیر اطمینان",
        definition:
          "شیری روی آبگرمکن مخزن‌دار که اگر فشار یا دمای آب از حد مجاز بالاتر رود، باز می‌شود و از آسیب به مخزن جلوگیری می‌کند.",
      },
      "anode-rod": {
        term: "میله آند",
        definition:
          "میله منیزیمی داخل مخزن آبگرمکن که به‌جای بدنه خورده می‌شود و عمر مخزن را بیشتر می‌کند. هر یک تا دو سال باید بازدید شود.",
      },
      "enamel-lining": {
        term: "پوشش لعابی مخزن",
        definition:
          "لایه شیشه‌ای که در کوره روی دیواره داخلی مخزن آبگرمکن پخته می‌شود و فولاد را از تماس مستقیم با آب و خوردگی دور نگه می‌دارد.",
      },
      "tank-capacity": {
        term: "حجم مخزن",
        definition:
          "مقدار آبی که آبگرمکن مخزن‌دار گرم نگه می‌دارد، بر حسب لیتر. برای خانواده سه تا چهار نفره، ۸۰ تا ۱۰۰ لیتر معمولاً کافی است.",
      },
      "instant-water-heater": {
        term: "آبگرمکن فوری",
        definition:
          "آبگرمکن بدون مخزن که آب را فقط هنگام باز شدن شیر گرم می‌کند. جای کمی می‌گیرد و گاز را تنها هنگام مصرف می‌سوزاند.",
      },
      "oil-filled-radiator": {
        term: "شوفاژ برقی روغنی",
        definition:
          "بخاری برقی با پره‌های پر از روغن که گرما را آرام و یکنواخت پخش می‌کند و پس از خاموش شدن هم مدتی گرم می‌ماند.",
      },
      "ip-rating": {
        term: "درجه حفاظت IP",
        definition:
          "کدی دورقمی که مقاومت دستگاه را در برابر گردوغبار (رقم اول) و آب (رقم دوم) نشان می‌دهد؛ مثلاً IP24 یعنی مقاوم در برابر پاشش آب.",
      },
      "warranty-code": {
        term: "کد گارانتی",
        definition:
          "کد ۹ نویسه‌ای روی برچسب هر دستگاه ماندگار. با وارد کردنش در صفحه استعلام، مدل، سال تولید و وضعیت گارانتی را می‌بینی.",
      },
    },
  },
  en: {
    metaTitle: "Home appliance glossary",
    metaDescription:
      "Plain-English meanings of the technical terms used for coolers, heaters and water heaters, from cellulose pads and airflow to anode rods and safety valves.",
    eyebrow: "Glossary",
    title: "Appliance jargon, made simple",
    description:
      "The terms you meet in catalogues, on rating labels and in installation guides, explained briefly and plainly.",
    alphabet: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
    jumpLabel: "Jump to letter",
    termCount: "{count} terms",
    related: "Learn more",
    copyLink: "Direct link to {term}",
    pages: {
      warranty: "Warranty check",
      compare: "Compare models",
    },
    terms: {
      "evaporative-cooling": {
        term: "Evaporative cooling",
        definition:
          "Cooling air by evaporating water. Warm air passes through wet pads, some of the water evaporates and the air temperature drops. It works best in dry climates.",
      },
      "cellulose-pad": {
        term: "Cellulose pad",
        definition:
          "A honeycomb pad made of cellulose paper that has replaced wood-wool pads in coolers. It has more contact area with water, scales up more slowly and lasts several seasons.",
      },
      airflow: {
        term: "Airflow (m³/h)",
        definition:
          "The volume of air an appliance moves in an hour. For an evaporative cooler, multiply your home's volume by 20 to get the airflow you need.",
      },
      "float-valve": {
        term: "Float valve",
        definition:
          "A valve that closes as the water level in the cooler sump rises, preventing overflow. A badly set float wastes water or leaves the pump running dry.",
      },
      "cooler-pump": {
        term: "Cooler pump",
        definition:
          "The small pump that lifts water from the sump to the top of the pads. If the pads stay dry, check the pump and the water channels first.",
      },
      "blower-belt": {
        term: "Blower and belt",
        definition:
          "The blower draws air through the pads and pushes it into the home, and the belt carries power from the motor to it. A loose or cracked belt cuts airflow and adds noise.",
      },
      "bldc-motor": {
        term: "BLDC motor",
        definition:
          "A brushless DC motor with electronic control. It uses less power, runs quieter, lasts longer and holds its speed more precisely than a conventional motor.",
      },
      inverter: {
        term: "Inverter",
        definition:
          "A circuit that ramps an appliance's power up and down instead of switching it fully on and off. The result is lower power use and steadier operation.",
      },
      "energy-class": {
        term: "Energy class",
        definition:
          "An appliance's energy rating on the energy label, from A (most efficient) to G. The better the class, the lower the power bills over the appliance's life.",
      },
      thermostat: {
        term: "Thermostat",
        definition:
          "A sensor that measures temperature and switches the appliance on or off at the set point, keeping the temperature steady without wasting energy.",
      },
      "heating-capacity": {
        term: "Heating capacity",
        definition:
          "How much heat a heater produces in an hour, in kcal/h or kW. The right capacity depends on floor area, insulation and climate.",
      },
      flue: {
        term: "Flue",
        definition:
          "The duct that carries combustion gases out of the building. An open, standard flue is the most important safety requirement for gas heaters and water heaters.",
      },
      "h-cowl": {
        term: "H cowl",
        definition:
          "An H-shaped cap fitted on top of the flue on the roof. It stops the wind from pushing flue gases back into the home.",
      },
      "pilot-light": {
        term: "Pilot light",
        definition:
          "A small, always-on flame that lights the main burner of a heater or water heater. A healthy pilot flame is blue and steady.",
      },
      thermocouple: {
        term: "Thermocouple",
        definition:
          "A heat sensor beside the pilot flame. If the flame goes out, the thermocouple cools and closes the gas valve so no gas escapes.",
      },
      "oxygen-sensor": {
        term: "Oxygen depletion sensor",
        definition:
          "A safety system that shuts the heater off when the oxygen level in the room drops. It is a key layer of protection against carbon monoxide poisoning.",
      },
      "safety-valve": {
        term: "Safety valve",
        definition:
          "A valve on a storage water heater that opens when water pressure or temperature goes above the limit, protecting the tank from damage.",
      },
      "anode-rod": {
        term: "Anode rod",
        definition:
          "A magnesium rod inside the water heater tank that corrodes instead of the tank itself, extending its life. Inspect it every one to two years.",
      },
      "enamel-lining": {
        term: "Enamel lining",
        definition:
          "A glass layer fired onto the inside of a water heater tank that keeps the steel away from direct contact with water and corrosion.",
      },
      "tank-capacity": {
        term: "Tank capacity",
        definition:
          "How much water a storage heater keeps hot, in litres. For a household of three to four, 80 to 100 litres is usually enough.",
      },
      "instant-water-heater": {
        term: "Instant water heater",
        definition:
          "A tankless heater that warms water only while a tap is open. It takes little space and burns gas only when hot water is in use.",
      },
      "oil-filled-radiator": {
        term: "Oil-filled radiator",
        definition:
          "An electric heater with oil-filled fins that spreads heat gently and evenly, and stays warm for a while after it is switched off.",
      },
      "ip-rating": {
        term: "IP rating",
        definition:
          "A two-digit code for an appliance's protection against dust (first digit) and water (second digit); IP24, for example, means protected against splashing water.",
      },
      "warranty-code": {
        term: "Warranty code",
        definition:
          "The 9-character code on every Mandegar appliance's label. Enter it on the warranty check page to see the model, production year and warranty status.",
      },
    },
  },
};
