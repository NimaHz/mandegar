export const glossarySlugs = [
  "evaporative-cooling",
  "cellulose-pad",
  "airflow",
  "float-valve",
  "cooler-pump",
  "blower-belt",
  "bldc-motor",
  "inverter",
  "energy-class",
  "thermostat",
  "heating-capacity",
  "flue",
  "h-cowl",
  "pilot-light",
  "thermocouple",
  "oxygen-sensor",
  "safety-valve",
  "anode-rod",
  "enamel-lining",
  "tank-capacity",
  "instant-water-heater",
  "oil-filled-radiator",
  "ip-rating",
  "warranty-code",
] as const;

export type GlossarySlug = (typeof glossarySlugs)[number];

export type GlossaryRelation =
  | { kind: "category"; slug: string }
  | { kind: "guide"; slug: string }
  | { kind: "page"; page: "warranty" | "compare" };

const category = (slug: string): GlossaryRelation => ({ kind: "category", slug });
const guide = (slug: string): GlossaryRelation => ({ kind: "guide", slug });

export const glossaryRelations: Record<GlossarySlug, GlossaryRelation[]> = {
  "evaporative-cooling": [category("evaporative-coolers")],
  "cellulose-pad": [category("evaporative-coolers"), guide("evaporative-cooler-installation")],
  airflow: [category("evaporative-coolers"), category("fans")],
  "float-valve": [guide("evaporative-cooler-installation")],
  "cooler-pump": [category("evaporative-coolers")],
  "blower-belt": [category("evaporative-coolers")],
  "bldc-motor": [category("fans")],
  inverter: [category("kitchen-appliances")],
  "energy-class": [{ kind: "page", page: "compare" }],
  thermostat: [category("electric-heaters"), category("water-heaters")],
  "heating-capacity": [category("gas-heaters"), category("electric-heaters")],
  flue: [category("gas-heaters"), guide("gas-heater-installation")],
  "h-cowl": [guide("gas-heater-installation")],
  "pilot-light": [category("gas-heaters"), category("water-heaters")],
  thermocouple: [category("gas-heaters")],
  "oxygen-sensor": [category("gas-heaters"), guide("gas-heater-installation")],
  "safety-valve": [category("water-heaters"), guide("water-heater-installation")],
  "anode-rod": [category("water-heaters")],
  "enamel-lining": [category("water-heaters")],
  "tank-capacity": [category("water-heaters")],
  "instant-water-heater": [category("water-heaters"), guide("water-heater-installation")],
  "oil-filled-radiator": [category("electric-heaters"), guide("electric-heater-setup")],
  "ip-rating": [category("fans")],
  "warranty-code": [{ kind: "page", page: "warranty" }],
};

export const termAnchor = (slug: string) => `term-${slug}`;
