import "server-only";

import { createHash } from "node:crypto";

import sharp from "sharp";

import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { formatNumber } from "@/lib/format";
import { getStorage, isSafeStorageKey } from "@/server/storage";
import { api } from "@/services";
import type { ImageAsset } from "@/types/common";

import { seoContent } from "../content";
import { plainText, truncate } from "../text";
import { siteUrl } from "../urls";
import { ogPalette } from "./palette";
import { type OgEntityKind, ogImagePath, ogPages, type OgTarget } from "./targets";
import type { OgCard } from "./template";

const UPLOAD_PREFIX = "/uploads/";
const IMAGE_PIXELS = 800;
const TITLE_MAX = 90;
const SUBTITLE_MAX = 120;

type CardBody = Pick<OgCard, "kicker" | "title"> &
  Partial<Pick<OgCard, "subtitle" | "code" | "meta">> & {
    image?: ImageAsset | null;
    fit?: "cover" | "contain";
  };

const imageDataUri = async (asset: ImageAsset | null | undefined, fit: "cover" | "contain") => {
  if (!asset?.src.startsWith(UPLOAD_PREFIX)) return null;
  const key = asset.src.slice(UPLOAD_PREFIX.length);
  if (!isSafeStorageKey(key)) return null;
  try {
    const file = await (await getStorage()).get(key, null);
    if (!file) return null;
    const input = Buffer.from(await new Response(file.body).arrayBuffer());
    const output = await sharp(input)
      .resize(IMAGE_PIXELS, IMAGE_PIXELS, { fit, background: ogPalette.card })
      .flatten({ background: ogPalette.card })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${output.toString("base64")}`;
  } catch {
    return null;
  }
};

const cardBody = async (locale: Locale, target: OgTarget): Promise<CardBody | null> => {
  const { site, nav } = await getDictionary(locale);
  const copy = seoContent[locale];
  const count = (template: string, value: number) =>
    fill(template, { count: formatNumber(locale, value) });

  switch (target.kind) {
    case "page": {
      const label = ogPages[target.key];
      return label
        ? { kicker: site.slogan, title: nav[label] }
        : { kicker: copy.homeKicker, title: site.slogan, subtitle: site.description };
    }
    case "product": {
      const product = await api.catalog.product(locale, target.slug);
      return (
        product && {
          kicker: product.category.name,
          title: product.name,
          subtitle: product.tagline,
          code: product.modelCode,
          meta: [count(copy.warrantyMonths, product.warrantyMonths)],
          image: product.image,
        }
      );
    }
    case "category": {
      const category = await api.catalog.category(locale, target.slug);
      return (
        category && {
          kicker: nav.products,
          title: category.name,
          subtitle: category.summary,
          meta: [count(copy.models, category.productCount)],
          image: category.image,
        }
      );
    }
    case "brand": {
      const brand = await api.catalog.brand(locale, target.slug);
      return (
        brand && {
          kicker: nav.brands,
          title: brand.name,
          subtitle: plainText(brand.description),
          meta: [count(copy.models, brand.productCount)],
          image: brand.logo,
          fit: "contain",
        }
      );
    }
    case "guide": {
      const guide = await api.content.guide(locale, target.slug);
      return (
        guide && {
          kicker: nav.guides,
          title: guide.title,
          subtitle: guide.summary,
          meta: [
            count(copy.steps, guide.stepCount),
            ...(guide.durationSec ? [count(copy.minutes, Math.ceil(guide.durationSec / 60))] : []),
          ],
          image: guide.poster,
        }
      );
    }
    case "post": {
      const post = await api.content.post(locale, target.slug);
      return (
        post && {
          kicker: nav.blog,
          title: post.title,
          subtitle: post.author.name,
          meta: [count(copy.readingMinutes, post.readingMinutes)],
          image: post.cover,
        }
      );
    }
    case "author": {
      const author = await api.content.author(locale, target.slug);
      return (
        author && {
          kicker: nav.blog,
          title: author.name,
          subtitle: author.role,
          image: author.avatar,
        }
      );
    }
  }
};

const fingerprint = (body: CardBody) =>
  createHash("sha256")
    .update(
      JSON.stringify([
        body.kicker,
        body.title,
        body.subtitle ?? null,
        body.code ?? null,
        body.meta ?? [],
        body.image?.src ?? null,
        body.fit ?? null,
      ]),
    )
    .digest("base64url")
    .slice(0, 12);

export const ogEntityTarget = async (
  locale: Locale,
  kind: OgEntityKind,
  slug: string,
): Promise<OgTarget> => {
  const body = await cardBody(locale, { kind, slug });
  return { kind, slug, version: body ? fingerprint(body) : null };
};

export const loadOgCard = async (locale: Locale, target: OgTarget) => {
  const body = await cardBody(locale, target);
  if (!body) return null;
  const path = ogImagePath(
    locale,
    target.kind === "page" ? target : { ...target, version: fingerprint(body) },
  );
  const card = async (): Promise<OgCard> => {
    const { site } = await getDictionary(locale);
    return {
      locale,
      brand: site.name,
      kicker: body.kicker,
      title: truncate(body.title, TITLE_MAX),
      subtitle: body.subtitle ? truncate(body.subtitle, SUBTITLE_MAX) : null,
      code: body.code ?? null,
      meta: body.meta ?? [],
      image: await imageDataUri(body.image, body.fit ?? "cover"),
      host: new URL(siteUrl).host,
    };
  };
  return { path, card };
};
