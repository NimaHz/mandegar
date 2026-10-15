import type { LucideIcon, LucideProps } from "lucide-react";
import {
  AirVent,
  CookingPot,
  Droplet,
  Droplets,
  Fan,
  Flame,
  Gauge,
  Heater,
  Layers,
  Leaf,
  Lock,
  Microwave,
  Plug,
  Power,
  RefreshCw,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Sun,
  Thermometer,
  Timer,
  Volume1,
  VolumeX,
  Waves,
  Wifi,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "air-vent": AirVent,
  "cooking-pot": CookingPot,
  droplet: Droplet,
  droplets: Droplets,
  fan: Fan,
  flame: Flame,
  gauge: Gauge,
  heater: Heater,
  layers: Layers,
  leaf: Leaf,
  lock: Lock,
  microwave: Microwave,
  plug: Plug,
  power: Power,
  "refresh-cw": RefreshCw,
  "settings-2": Settings2,
  shield: Shield,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  "sliders-horizontal": SlidersHorizontal,
  snowflake: Snowflake,
  sparkles: Sparkles,
  sun: Sun,
  thermometer: Thermometer,
  timer: Timer,
  "volume-1": Volume1,
  "volume-x": VolumeX,
  waves: Waves,
  wifi: Wifi,
  wind: Wind,
  wrench: Wrench,
  zap: Zap,
};

interface FeatureIconProps extends LucideProps {
  name: string;
}

export function FeatureIcon({ name, ...props }: FeatureIconProps) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon aria-hidden {...props} />;
}
