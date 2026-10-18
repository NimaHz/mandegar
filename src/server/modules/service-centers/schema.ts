import { z } from "@/lib/zod";
import {
  expectedUpdatedAtSchema,
  listQuerySchema,
  localizedText,
  optionalFilter,
  phoneNumberSchema,
  provinceSchema,
  slugSchema,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts } from "@/types/admin";
import { serviceCenterKinds } from "@/types/content";

export const serviceCenterInputSchema = z.object({
  slug: slugSchema,
  kind: z.enum(serviceCenterKinds),
  name: localizedText(120),
  province: provinceSchema,
  city: localizedText(60),
  address: localizedText(300),
  phones: z.array(phoneNumberSchema).max(6),
  hours: localizedText(200),
  lat: z.number().min(24).max(40).nullable(),
  lng: z.number().min(44).max(64).nullable(),
  categoryIds: z.array(z.uuid()).max(30),
  active: z.boolean(),
});

export const serviceCenterPatchSchema = serviceCenterInputSchema
  .partial()
  .extend({ expectedUpdatedAt: expectedUpdatedAtSchema });

export const serviceCentersQuerySchema = listQuerySchema.extend({
  province: optionalFilter(provinceSchema),
  kind: optionalFilter(z.enum(serviceCenterKinds)),
  sort: sortSchema(adminSorts.serviceCenters),
});
