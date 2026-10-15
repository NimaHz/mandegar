import "server-only";

import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { api } from "@/services";

import { buildGraph } from "./jsonld/graph";
import { organizationNode, ownBrandNode, websiteNode } from "./jsonld/organization";
import type { JsonLdGraph, MaybeNode } from "./jsonld/types";

const getSiteNodes = cache(async (locale: Locale) => {
  const [settings, { site }] = await Promise.all([
    api.content.settings(locale),
    getDictionary(locale),
  ]);
  return {
    settings,
    nodes: [
      organizationNode({ locale, settings, description: site.description }),
      ownBrandNode(locale, site.slogan),
      websiteNode(locale, site.name, site.description),
    ],
  };
});

export const pageGraph = async (locale: Locale, nodes: MaybeNode[]): Promise<JsonLdGraph> => {
  const site = await getSiteNodes(locale);
  return buildGraph([...site.nodes, ...nodes]);
};
