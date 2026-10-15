"use client";

import {
  CircleCheck,
  Lightbulb,
  type LucideIcon,
  MessageCircleQuestion,
  MessageSquareWarning,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useFormContext, useFormState } from "react-hook-form";

import { type TicketType, ticketTypes } from "@/types/support";

import type { RequestValues } from "../../schemas";

const icons: Record<TicketType, LucideIcon> = {
  "warranty-repair": ShieldCheck,
  repair: Wrench,
  "spare-parts": Package,
  technical: MessageCircleQuestion,
  complaint: MessageSquareWarning,
  suggestion: Lightbulb,
};

interface TypeStepProps {
  legend: string;
  types: Record<TicketType, { label: string; description: string }>;
}

export function TypeStep({ legend, types }: TypeStepProps) {
  const { register } = useFormContext<RequestValues>();
  const { errors } = useFormState<RequestValues>();
  const error = errors.type?.message;

  return (
    <fieldset aria-describedby={error ? "request-type-error" : undefined}>
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {ticketTypes.map((type) => {
          const Icon = icons[type];
          return (
            <label
              key={type}
              className="group relative flex cursor-pointer items-start gap-3.5 rounded-card border border-line-strong bg-raised p-4 transition-[border-color,background-color,box-shadow] duration-200 hover:border-primary/60 has-checked:border-primary has-checked:bg-primary-soft/50 has-checked:shadow-card has-focus-visible:ring-3 has-focus-visible:ring-primary/25"
            >
              <input type="radio" value={type} className="sr-only" {...register("type")} />
              <span className="icon-tile size-11 rounded-field transition-colors group-has-checked:bg-primary group-has-checked:text-on-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1 pe-6">
                <span className="text-base font-extrabold text-ink">{types[type].label}</span>
                <span className="text-xs leading-6 text-body">{types[type].description}</span>
              </span>
              <CircleCheck
                className="absolute end-3.5 top-3.5 size-5 text-primary opacity-0 transition-opacity group-has-checked:opacity-100"
                aria-hidden
              />
            </label>
          );
        })}
      </div>
      {error && (
        <p id="request-type-error" role="alert" className="mt-3 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
