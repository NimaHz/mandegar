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
import { type KeyboardEvent, useId } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/cn";
import { isRtl } from "@/lib/dom";

import { adminContent } from "../../content";
import { useFieldError } from "./use-field-error";

const { names } = adminContent.iconPicker;

type IconName = keyof typeof names;

type IconSet = Partial<Record<IconName, LucideIcon>>;

export const categoryIcons = {
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
} satisfies IconSet;

const featureIcons = {
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
} satisfies Record<IconName, LucideIcon>;

const isIconName = (key: string): key is IconName => key in names;

interface IconPickerProps {
  name: string;
  label: string;
  set?: IconSet;
}

export function IconPicker({ name, label, set = featureIcons }: IconPickerProps) {
  const id = useId();
  const { control } = useFormContext();
  const error = useFieldError(name);
  const options = Object.entries(set).flatMap(([key, Icon]) =>
    isIconName(key) ? [{ key, Icon, label: names[key] }] : [],
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.findIndex((option) => option.key === field.value);
        const focusable = Math.max(selected, 0);

        const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
          const forward = (focusable + 1) % options.length;
          const backward = (focusable - 1 + options.length) % options.length;
          const rtl = isRtl(event.currentTarget);
          const targets: Partial<Record<string, number>> = {
            ArrowLeft: rtl ? forward : backward,
            ArrowRight: rtl ? backward : forward,
            ArrowUp: backward,
            ArrowDown: forward,
            Home: 0,
            End: options.length - 1,
          };
          const target = targets[event.key];
          if (target === undefined) return;
          const next = options[target];
          if (!next) return;
          event.preventDefault();
          field.onChange(next.key);
          event.currentTarget
            .querySelectorAll<HTMLButtonElement>('[role="radio"]')
            [target]?.focus();
        };

        return (
          <div className="flex flex-col gap-1.5">
            <span id={id} className="text-label font-bold text-ink">
              {label}
            </span>
            <div
              role="radiogroup"
              aria-labelledby={id}
              onKeyDown={handleKeyDown}
              className="flex flex-wrap gap-1.5"
            >
              {options.map(({ key, Icon, label: optionLabel }, index) => {
                const checked = index === selected;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={optionLabel}
                    title={optionLabel}
                    tabIndex={index === focusable ? 0 : -1}
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
        );
      }}
    />
  );
}
