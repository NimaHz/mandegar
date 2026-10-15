import { type Locale, localeMeta } from "@/i18n/config";
import type { GuideStep } from "@/types/content";

import { plainText } from "../text";
import { absoluteUrl } from "../urls";
import type { JsonLdNode, JsonLdRef } from "./types";

interface HowToInput {
  id: string;
  locale: Locale;
  url: string;
  name: string;
  description: string;
  image?: string | null;
  steps: GuideStep[];
  tools: string[];
  stepAnchor?: (index: number) => string;
  video?: JsonLdRef | null;
}

export const howToNode = ({
  id,
  locale,
  url,
  name,
  description,
  image,
  steps,
  tools,
  stepAnchor,
  video,
}: HowToInput): JsonLdNode => ({
  "@type": "HowTo",
  "@id": id,
  name,
  description,
  url,
  image: image ? absoluteUrl(image) : null,
  inLanguage: localeMeta[locale].hreflang,
  tool: tools.map((tool) => ({ "@type": "HowToTool", name: tool })),
  step: steps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.title,
    text: plainText(step.body),
    image: step.image ? absoluteUrl(step.image.src) : null,
    url: stepAnchor ? `${url}#${stepAnchor(index)}` : null,
  })),
  video,
});
