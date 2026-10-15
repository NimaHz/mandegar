import "server-only";

import { revalidatePath } from "next/cache";

import { pingIndexNowPaths } from "./indexnow";

const FEEDS = ["/sitemap.xml", "/llms.txt", "/llms-full.txt"];

const run = (path: string, type?: "layout" | "page") => {
  try {
    revalidatePath(path, type);
  } catch {
    return;
  }
};

const localizedVariants = (path: string) =>
  path === "/" ? ["/", "/fa", "/en"] : [path, `/fa${path}`, `/en${path}`];

const revalidateFeeds = () => {
  for (const feed of FEEDS) run(feed);
  run("/sitemaps", "layout");
};

export const revalidatePages = (paths: readonly (string | null | undefined)[]) => {
  const unique = [...new Set(paths.filter((entry): entry is string => Boolean(entry)))];
  for (const path of unique) {
    for (const variant of localizedVariants(path)) run(variant);
  }
  revalidateFeeds();
  void pingIndexNowPaths(unique);
};

export const revalidateRoutes = (patterns: readonly string[]) => {
  for (const pattern of patterns) run(`/[locale]/(site)${pattern}`, "page");
};

export const revalidateSite = () => {
  run("/", "layout");
  revalidateFeeds();
};
