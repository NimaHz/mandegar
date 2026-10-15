"use client";

import type { LucideIcon } from "lucide-react";
import {
  AirVent,
  Battery,
  Clock,
  CookingPot,
  Droplets,
  Fan,
  Flame,
  Gauge,
  Heater,
  Layers,
  Leaf,
  Microwave,
  Package,
  Power,
  RefreshCw,
  Refrigerator,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShowerHead,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Thermometer,
  Timer,
  Volume1,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";
import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/cn";

import { useFieldError } from "./use-field-error";

export const categoryIcons: Record<string, LucideIcon> = {
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

export const featureIcons: Record<string, LucideIcon> = {
  ...categoryIcons,
  gauge: Gauge,
  shield: Shield,
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
  layers: Layers,
  "refresh-cw": RefreshCw,
  "volume-1": Volume1,
  sparkles: Sparkles,
  timer: Timer,
  clock: Clock,
  "sliders-horizontal": SlidersHorizontal,
  power: Power,
  leaf: Leaf,
  wifi: Wifi,
  battery: Battery,
};

export function IconGlyph({
  name,
  set = featureIcons,
  className,
}: {
  name: string;
  set?: Record<string, LucideIcon>;
  className?: string;
}) {
  const Icon = set[name] ?? Package;
  return <Icon className={className} aria-hidden />;
}

interface IconPickerProps {
  name: string;
  label: string;
  set?: Record<string, LucideIcon>;
}

export function IconPicker({ name, label, set = featureIcons }: IconPickerProps) {
  const id = useId();
  const { control } = useFormContext();
  const error = useFieldError(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-1.5">
          <span id={id} className="text-label font-bold text-ink">
            {label}
          </span>
          <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-1.5">
            {Object.entries(set).map(([key, Icon]) => {
              const checked = field.value === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={key}
                  title={key}
                  onClick={() => field.onChange(key)}
                  className={cn(
                    "grid size-10 place-items-center rounded-control border transition-colors",
                    checked
                      ? "border-primary bg-primary text-on-primary shadow-primary"
                      : "border-line bg-raised text-ink-soft hover:border-ink/40 hover:text-ink",
                  )}
                >
                  <Icon className="size-4.5" strokeWidth={1.8} aria-hidden />
                </button>
              );
            })}
          </div>
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
        </div>
      )}
    />
  );
}
