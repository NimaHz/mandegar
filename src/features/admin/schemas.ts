import { z } from "zod";

import { isRecord } from "@/lib/guards";
import { toLatinDigits } from "@/lib/persian";
import { localizedText } from "@/server/lib/validation";
import { authorInputSchema } from "@/server/modules/authors/schema";
import { brandInputSchema } from "@/server/modules/brands/schema";
import { categoryInputSchema } from "@/server/modules/categories/schema";
import { faqInputSchema } from "@/server/modules/faqs/schema";
import { guideInputSchema } from "@/server/modules/guides/schema";
import { postInputSchema } from "@/server/modules/posts/schema";
import {
  productImagesSchema,
  productInputSchema,
  specTemplateItemSchema,
  uniqueSpecKeys,
} from "@/server/modules/products/schema";
import { serviceCenterInputSchema } from "@/server/modules/service-centers/schema";
import { slideInputSchema } from "@/server/modules/slides/schema";
import { warrantyPolicyInputSchema } from "@/server/modules/warranty/schema";
import type { LocalizedSeo } from "@/types/admin";
import type { LocalizedText } from "@/types/common";

import { adminContent } from "./content";
import { CLOCK_PATTERN, parseClock } from "./lib/format";

export const blankText = (): LocalizedText => ({ fa: "", en: "" });

const isBlankText = (value: unknown) =>
  !isRecord(value) || (!String(value.fa ?? "").trim() && !String(value.en ?? "").trim());

export const blankToNull = (value: unknown) =>
  value === "" || (typeof value === "string" && !value.trim()) ? null : value;

const nullableText = (max: number) =>
  z.preprocess((value) => (isBlankText(value) ? null : value), localizedText(max).nullable());

const nullableString = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.preprocess(blankToNull, schema.nullable());

const seoFormSchema = z.preprocess(
  (value) =>
    isRecord(value) && isBlankText(value.title) && isBlankText(value.description) ? null : value,
  z
    .object({
      title: z.object({ fa: z.string().trim().max(80), en: z.string().trim().max(80) }),
      description: z.object({ fa: z.string().trim().max(200), en: z.string().trim().max(200) }),
    })
    .nullable(),
);

export const seoToForm = (seo: LocalizedSeo | null) => ({
  title: seo?.title ?? blankText(),
  description: seo?.description ?? blankText(),
});

const specTemplateItemForm = specTemplateItemSchema.extend({
  unit: nullableText(30),
  unitCode: nullableString(z.string().trim().max(10)),
});

const specItemForm = specTemplateItemForm.extend({
  value: localizedText(200),
  numeric: z.number().finite().nullable(),
});

const specGroupTemplateForm = z.object({
  title: localizedText(80),
  items: z.array(specTemplateItemForm).max(40),
});

const specGroupForm = z.object({
  title: localizedText(80),
  items: z.array(specItemForm).max(40),
});

export const productFormSchema = productInputSchema.extend({
  specs: z.array(specGroupForm).max(20).superRefine(uniqueSpecKeys(adminContent.validation.taken)),
  seo: seoFormSchema,
  images: productImagesSchema.shape.images,
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;

export const categoryFormSchema = categoryInputSchema.extend({
  specTemplate: z
    .array(specGroupTemplateForm)
    .max(20)
    .superRefine(uniqueSpecKeys(adminContent.validation.taken)),
  seo: seoFormSchema,
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;

export const brandFormSchema = brandInputSchema.extend({
  website: nullableString(z.url({ protocol: /^https?$/ }).max(300)),
});

export type BrandFormInput = z.input<typeof brandFormSchema>;
export type BrandFormValues = z.output<typeof brandFormSchema>;

const guideVideoForm = z.object({
  kind: z.enum(["none", "upload", "aparat"]),
  mediaId: z.string().nullable(),
  hash: z.string().trim().max(64),
  posterMediaId: z.string().nullable(),
});

const clock = z.string().trim().overwrite(toLatinDigits).regex(CLOCK_PATTERN);

export const guideFormSchema = guideInputSchema
  .omit({ video: true })
  .extend({
    video: guideVideoForm,
    durationSec: z.union([z.literal(""), clock]),
    chapters: z.array(z.object({ title: localizedText(120), startSec: clock })).max(60),
  })
  .superRefine(({ durationSec, chapters }, context) => {
    const duration = parseClock(durationSec);
    const starts = chapters.map((chapter) => parseClock(chapter.startSec));
    starts.forEach((start, index) => {
      if (start === null) return;
      const message =
        duration && start >= duration
          ? adminContent.validation.afterDuration
          : starts.indexOf(start) < index
            ? adminContent.validation.taken
            : null;
      if (message) {
        context.addIssue({ code: "custom", path: ["chapters", index, "startSec"], message });
      }
    });
  });

export type GuideFormInput = z.input<typeof guideFormSchema>;
export type GuideFormValues = z.output<typeof guideFormSchema>;

export const slideFormSchema = slideInputSchema
  .extend({
    ctaLabel: nullableText(40),
    ctaHref: nullableString(slideInputSchema.shape.ctaHref.unwrap()),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
  })
  .superRefine(({ startsAt, endsAt }, context) => {
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: adminContent.validation.endBeforeStart,
      });
    }
  });

export type SlideFormInput = z.input<typeof slideFormSchema>;
export type SlideFormValues = z.output<typeof slideFormSchema>;

export const faqFormSchema = faqInputSchema;
export type FaqFormInput = z.input<typeof faqFormSchema>;
export type FaqFormValues = z.output<typeof faqFormSchema>;

export const authorFormSchema = authorInputSchema.extend({
  sameAs: z.array(z.object({ url: z.url({ protocol: /^https$/ }).max(300) })).max(10),
});
export type AuthorFormInput = z.input<typeof authorFormSchema>;
export type AuthorFormValues = z.output<typeof authorFormSchema>;

export const postFormSchema = postInputSchema.extend({
  seo: seoFormSchema,
  publishedAt: z.string().nullable(),
});
export type PostFormInput = z.input<typeof postFormSchema>;
export type PostFormValues = z.output<typeof postFormSchema>;

export const serviceCenterFormSchema = serviceCenterInputSchema.extend({
  phones: z.array(z.object({ value: serviceCenterInputSchema.shape.phones.element })).max(6),
});
export type ServiceCenterFormInput = z.input<typeof serviceCenterFormSchema>;
export type ServiceCenterFormValues = z.output<typeof serviceCenterFormSchema>;

export const policyFormSchema = warrantyPolicyInputSchema;
export type PolicyFormInput = z.input<typeof policyFormSchema>;
export type PolicyFormValues = z.output<typeof policyFormSchema>;
