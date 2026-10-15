import { z } from "zod";

import {
  listQuerySchema,
  localizedText,
  optionalFilter,
  provinceSchema,
  slugSchema,
} from "@/server/lib/validation";
import { serviceCenterKinds } from "@/types/content";

export const serviceCenterInputSchema = z.object({
  slug: slugSchema,
  kind: z.enum(serviceCenterKinds),
  name: localizedText(120),
  province: provinceSchema,
  city: localizedText(60),
  address: localizedText(300),
  phones: z
    .array(
      z
        .string()
        .trim()
        .min(4)
        .max(30)
        .regex(/^[+\d][\d\s-]*$/),
    )
    .max(6),
  hours: localizedText(200),
  lat: z.number().min(24).max(40).nullable(),
  lng: z.number().min(44).max(64).nullable(),
  categoryIds: z.array(z.uuid()).max(30),
  active: z.boolean(),
});

export const serviceCenterPatchSchema = serviceCenterInputSchema.partial();

export const serviceCentersQuerySchema = listQuerySchema.extend({
  province: optionalFilter(provinceSchema),
  kind: optionalFilter(z.enum(serviceCenterKinds)),
});
