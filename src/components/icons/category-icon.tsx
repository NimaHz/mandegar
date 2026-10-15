import type { LucideIcon, LucideProps } from "lucide-react";
import {
  AirVent,
  CookingPot,
  Droplets,
  Fan,
  Flame,
  Heater,
  Microwave,
  Package,
  Refrigerator,
  ShowerHead,
  Snowflake,
  Thermometer,
  WashingMachine,
  Waves,
  Wind,
  Zap,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "air-vent": AirVent,
  "cooking-pot": CookingPot,
  droplets: Droplets,
  fan: Fan,
  flame: Flame,
  heater: Heater,
  microwave: Microwave,
  refrigerator: Refrigerator,
  "shower-head": ShowerHead,
  snowflake: Snowflake,
  thermometer: Thermometer,
  "washing-machine": WashingMachine,
  waves: Waves,
  wind: Wind,
  zap: Zap,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = icons[name] ?? Package;
  return <Icon aria-hidden {...props} />;
}
