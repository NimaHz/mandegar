import { z } from "@/lib/zod";
import { listQuerySchema, optionalFilter } from "@/server/lib/validation";

export const auditQuerySchema = listQuerySchema.extend({
  entity: optionalFilter(
    z
      .string()
      .trim()
      .max(40)
      .regex(/^[a-z-]+$/),
  ),
  action: optionalFilter(
    z
      .string()
      .trim()
      .max(40)
      .regex(/^[a-z.-]+$/),
  ),
  actorId: optionalFilter(z.uuid()),
});
