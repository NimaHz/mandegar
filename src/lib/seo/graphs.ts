import "server-only";

import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import type { BrandDetail, CategoryDetail, ProductDetail, ProductListItem } from "@/types/catalog";
import type {
  AuthorDetail,
  GuideDetail,
  PostDetail,
  PostListItem,
  ServiceCenter,
} from "@/types/content";

import { seoContent } from "./content";
import { pageGraph } from "./graph";
import { articleNode } from "./jsonld/article";
import { type BreadcrumbEntry, breadcrumbNode } from "./jsonld/breadcrumb";
import { faqSectionNode, type QuestionEntry, questionNodes } from "./jsonld/faq";
import { definedTermSetNode, type GlossaryEntry, glossaryId } from "./jsonld/glossary";
import { howToNode } from "./jsonld/howto";
import {
  blogId,
  brandId,
  guideArticleId,
  guideVideoId,
  nodeId,
  personId,
  postId,
  productId,
  ref,
  siteIds,
} from "./jsonld/ids";
import { type ItemListEntry, itemListNode, nodeListNode } from "./jsonld/item-list";
import { serviceCenterNode } from "./jsonld/local-business";
import { personNode } from "./jsonld/person";
import { type ProductGuideRef, productNode } from "./jsonld/product";
import { serviceNode } from "./jsonld/service";
import type { JsonLdNode, JsonLdRef, MaybeNode } from "./jsonld/types";
import { videoNode } from "./jsonld/video";
import { webPageNode,type WebPageType } from "./jsonld/webpage";
import { ogImagePath } from "./og/targets";
import { plainText, tehranIso } from "./text";
import { absoluteUrl, localeUrl } from "./urls";

interface PageText {
  name: string;
  description: string;
}

interface ServiceText extends PageText {
  serviceType: string;
  offers?: string[];
}

const productEntries = (locale: Locale, products: ProductListItem[]): ItemListEntry[] =>
  products.map((product) => ({
    url: localeUrl(locale, routes.product(product.slug)),
    name: product.name,
    image: product.image?.src,
  }));

const listId = (url: string) => nodeId(url, "itemlist");

interface WebPageGraphInput extends PageText {
  path: string;
  type?: WebPageType;
  breadcrumbs?: BreadcrumbEntry[];
  mainEntity?: JsonLdNode | JsonLdRef | (JsonLdNode | JsonLdRef)[];
  about?: JsonLdRef;
  image?: string | null;
  dateModified?: string | null;
  nodes?: MaybeNode[];
}

export const webPageGraph = (locale: Locale, input: WebPageGraphInput) => {
  const url = localeUrl(locale, input.path);
  return pageGraph(locale, [
    webPageNode({
      locale,
      url,
      type: input.type,
      name: input.name,
      description: input.description,
      breadcrumb: Boolean(input.breadcrumbs?.length),
      mainEntity: input.mainEntity,
      about: input.about,
      image: input.image,
      dateModified: input.dateModified,
    }),
    input.breadcrumbs?.length ? breadcrumbNode(url, input.breadcrumbs) : null,
    ...(input.nodes ?? []),
  ]);
};

export const homeGraph = (locale: Locale, text: PageText, featured: ProductListItem[]) => {
  const url = localeUrl(locale, routes.home);
  return webPageGraph(locale, {
    ...text,
    path: routes.home,
    about: ref(siteIds.organization),
    mainEntity: featured.length > 0 ? ref(listId(url)) : undefined,
    nodes: [
      featured.length > 0
        ? itemListNode({
            id: listId(url),
            name: text.name,
            entries: productEntries(locale, featured),
          })
        : null,
    ],
  });
};

interface CollectionGraphInput extends PageText {
  path: string;
  listName: string;
  entries: ItemListEntry[];
  breadcrumbs?: BreadcrumbEntry[];
  nodes?: MaybeNode[];
}

export const collectionGraph = (locale: Locale, input: CollectionGraphInput) => {
  const url = localeUrl(locale, input.path);
  return webPageGraph(locale, {
    ...input,
    type: "CollectionPage",
    mainEntity: input.entries.length > 0 ? ref(listId(url)) : undefined,
    nodes: [
      input.entries.length > 0
        ? itemListNode({ id: listId(url), name: input.listName, entries: input.entries })
        : null,
      ...(input.nodes ?? []),
    ],
  });
};

export const productListGraph = (
  locale: Locale,
  input: Omit<CollectionGraphInput, "entries"> & { products: ProductListItem[] },
) => collectionGraph(locale, { ...input, entries: productEntries(locale, input.products) });

export const categoryGraph = (
  locale: Locale,
  input: {
    category: CategoryDetail;
    products: ProductListItem[];
    breadcrumbs: BreadcrumbEntry[];
    faqTitle: string;
    faqs: QuestionEntry[];
  },
) => {
  const { category } = input;
  const url = localeUrl(locale, routes.category(category.slug));
  return productListGraph(locale, {
    path: routes.category(category.slug),
    name: category.name,
    description: category.summary,
    listName: category.name,
    products: input.products,
    breadcrumbs: input.breadcrumbs,
    nodes: [faqSectionNode(locale, url, input.faqTitle, input.faqs)],
  });
};

export const productGraph = (
  locale: Locale,
  input: {
    product: ProductDetail;
    related: ProductListItem[];
    guide: ProductGuideRef | null;
    breadcrumbs: BreadcrumbEntry[];
    faqTitle: string;
    service: ServiceText;
  },
) => {
  const { product } = input;
  const copy = seoContent[locale];
  const url = localeUrl(locale, routes.product(product.slug));
  return webPageGraph(locale, {
    path: routes.product(product.slug),
    type: "ItemPage",
    name: product.name,
    description: product.summary || product.tagline,
    breadcrumbs: input.breadcrumbs,
    mainEntity: ref(productId(locale, product.slug)),
    image: product.image?.src,
    dateModified: product.updatedAt,
    nodes: [
      productNode({
        locale,
        product,
        related: input.related,
        guide: input.guide,
        warranty: { name: copy.warrantyName, unit: copy.monthUnit },
      }),
      serviceNode({
        id: siteIds.afterSalesService,
        locale,
        ...input.service,
        url: localeUrl(locale, routes.support),
        isRelatedTo: [ref(productId(locale, product.slug))],
      }),
      faqSectionNode(locale, url, input.faqTitle, product.faqs),
    ],
  });
};

const brandNode = (locale: Locale, brand: BrandDetail): JsonLdNode => ({
  "@type": "Brand",
  "@id": brandId(locale, brand),
  name: brand.name,
  description: plainText(brand.description),
  logo: brand.logo ? absoluteUrl(brand.logo.src) : null,
  url: localeUrl(locale, routes.brand(brand.slug)),
  sameAs: brand.website,
});

export const brandGraph = (
  locale: Locale,
  input: { brand: BrandDetail; products: ProductListItem[]; breadcrumbs: BreadcrumbEntry[] },
) =>
  productListGraph(locale, {
    path: routes.brand(input.brand.slug),
    name: input.brand.name,
    description: plainText(input.brand.description),
    listName: input.brand.name,
    products: input.products,
    breadcrumbs: input.breadcrumbs,
    nodes: [brandNode(locale, input.brand)],
  });

export const brandsGraph = (
  locale: Locale,
  text: PageText,
  brands: Pick<BrandDetail, "slug" | "name" | "isOwn" | "logo">[],
) =>
  collectionGraph(locale, {
    ...text,
    path: routes.brands,
    listName: text.name,
    entries: brands.map((brand) => ({
      url: localeUrl(locale, routes.brand(brand.slug)),
      name: brand.name,
      image: brand.logo?.src,
    })),
  });

export const serviceGraph = (
  locale: Locale,
  input: PageText & {
    path: string;
    service: ServiceText & { id: "warrantyService" | "afterSalesService"; phone?: string | null };
    faqTitle?: string;
    faqs?: QuestionEntry[];
  },
) => {
  const url = localeUrl(locale, input.path);
  const id = siteIds[input.service.id];
  return webPageGraph(locale, {
    path: input.path,
    name: input.name,
    description: input.description,
    mainEntity: ref(id),
    nodes: [
      serviceNode({ ...input.service, id, locale, url }),
      input.faqs ? faqSectionNode(locale, url, input.faqTitle ?? input.name, input.faqs) : null,
    ],
  });
};

export const guideGraph = (
  locale: Locale,
  input: {
    guide: GuideDetail;
    breadcrumbs: BreadcrumbEntry[];
    stepAnchor?: (index: number) => string;
  },
) => {
  const { guide } = input;
  const url = localeUrl(locale, routes.guide(guide.slug));
  const articleId = guideArticleId(locale, guide.slug);
  const videoId = guideVideoId(locale, guide.slug);
  const howToId = nodeId(url, "howto");
  const poster = guide.video?.poster ?? guide.poster;
  const modified = guide.updatedAt;
  return webPageGraph(locale, {
    path: routes.guide(guide.slug),
    name: guide.title,
    description: guide.summary,
    breadcrumbs: input.breadcrumbs,
    mainEntity: ref(articleId),
    image: guide.poster?.src,
    dateModified: modified,
    nodes: [
      articleNode({
        type: "TechArticle",
        id: articleId,
        locale,
        url,
        headline: guide.title,
        description: guide.summary,
        image: guide.poster?.src ?? ogImagePath(locale, { kind: "guide", slug: guide.slug }),
        datePublished: guide.publishedAt,
        dateModified: modified,
        author: ref(siteIds.organization),
        about: guide.products.map((product) => ({
          "@type": "Product",
          "@id": productId(locale, product.slug),
          name: product.name,
          model: product.modelCode,
          url: localeUrl(locale, routes.product(product.slug)),
        })),
        hasPart: guide.steps.length > 0 ? [ref(howToId)] : [],
        video: guide.video ? ref(videoId) : null,
      }),
      guide.steps.length > 0
        ? howToNode({
            id: howToId,
            locale,
            url,
            name: guide.title,
            description: guide.summary,
            image: guide.poster?.src,
            steps: guide.steps,
            tools: guide.tools,
            stepAnchor: input.stepAnchor,
            video: guide.video ? ref(videoId) : null,
          })
        : null,
      guide.video
        ? videoNode({
            id: videoId,
            locale,
            pageUrl: url,
            name: guide.title,
            description: guide.summary,
            video: guide.video,
            thumbnail: poster?.src ?? ogImagePath(locale, { kind: "guide", slug: guide.slug }),
            uploadDate: guide.publishedAt ?? guide.updatedAt,
            durationSec: guide.durationSec,
            chapters: guide.chapters,
          })
        : null,
    ],
  });
};

export const serviceCentersGraph = (
  locale: Locale,
  input: PageText & {
    centers: ServiceCenter[];
    breadcrumbs?: BreadcrumbEntry[];
    anchor?: (slug: string) => string;
    mapUrl?: (center: ServiceCenter) => string | null;
  },
) => {
  const url = localeUrl(locale, routes.serviceCenters);
  return webPageGraph(locale, {
    path: routes.serviceCenters,
    type: "CollectionPage",
    name: input.name,
    description: input.description,
    breadcrumbs: input.breadcrumbs,
    mainEntity: input.centers.length > 0 ? ref(listId(url)) : undefined,
    nodes: [
      input.centers.length > 0
        ? nodeListNode(
            listId(url),
            input.name,
            input.centers.map((center) =>
              serviceCenterNode({
                listUrl: url,
                center,
                anchor: input.anchor,
                mapUrl: input.mapUrl,
              }),
            ),
          )
        : null,
    ],
  });
};

const postStub = (locale: Locale, post: PostListItem): JsonLdNode => ({
  "@type": "BlogPosting",
  "@id": postId(locale, post.slug),
  headline: post.title,
  url: localeUrl(locale, routes.post(post.slug)),
  datePublished: tehranIso(post.publishedAt),
  image: post.cover ? absoluteUrl(post.cover.src) : null,
});

export const blogGraph = (
  locale: Locale,
  input: PageText & { posts: PostListItem[]; breadcrumbs?: BreadcrumbEntry[] },
) => {
  const url = localeUrl(locale, routes.blog);
  return webPageGraph(locale, {
    path: routes.blog,
    type: "CollectionPage",
    name: input.name,
    description: input.description,
    breadcrumbs: input.breadcrumbs,
    mainEntity: ref(blogId(locale)),
    nodes: [
      {
        "@type": "Blog",
        "@id": blogId(locale),
        name: input.name,
        description: input.description,
        url,
        publisher: ref(siteIds.organization),
        blogPost: input.posts.map((post) => postStub(locale, post)),
      },
    ],
  });
};

export const postGraph = (
  locale: Locale,
  input: {
    post: PostDetail;
    author: AuthorDetail | null;
    breadcrumbs: BreadcrumbEntry[];
    section?: string;
  },
) => {
  const { post } = input;
  const url = localeUrl(locale, routes.post(post.slug));
  const author = input.author ?? post.author;
  return webPageGraph(locale, {
    path: routes.post(post.slug),
    name: post.title,
    description: post.excerpt,
    breadcrumbs: input.breadcrumbs,
    mainEntity: ref(postId(locale, post.slug)),
    image: post.cover?.src,
    dateModified: post.updatedAt,
    nodes: [
      articleNode({
        type: "BlogPosting",
        id: postId(locale, post.slug),
        locale,
        url,
        headline: post.title,
        description: post.excerpt,
        image: post.cover?.src ?? ogImagePath(locale, { kind: "post", slug: post.slug }),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: ref(personId(locale, author.slug)),
        section: input.section,
        wordCount: plainText(post.body).split(" ").length,
        about: post.relatedProducts.map((product) => ({
          "@type": "Product",
          "@id": productId(locale, product.slug),
          name: product.name,
          model: product.modelCode,
          url: localeUrl(locale, routes.product(product.slug)),
        })),
        isPartOf: ref(blogId(locale)),
      }),
      personNode(locale, author),
      {
        "@type": "Blog",
        "@id": blogId(locale),
        url: localeUrl(locale, routes.blog),
        publisher: ref(siteIds.organization),
      },
    ],
  });
};

export const authorGraph = (
  locale: Locale,
  input: { author: AuthorDetail; posts: PostListItem[]; breadcrumbs?: BreadcrumbEntry[] },
) =>
  webPageGraph(locale, {
    path: routes.author(input.author.slug),
    type: "ProfilePage",
    name: input.author.name,
    description: input.author.bio || input.author.role,
    breadcrumbs: input.breadcrumbs,
    mainEntity: ref(personId(locale, input.author.slug)),
    nodes: [
      {
        ...personNode(locale, input.author),
        subjectOf: input.posts.map((post) => postStub(locale, post)),
      },
    ],
  });

export const faqGraph = (locale: Locale, text: PageText, faqs: QuestionEntry[]) =>
  webPageGraph(locale, {
    ...text,
    path: routes.faq,
    type: "FAQPage",
    mainEntity: questionNodes(faqs),
  });

export const glossaryGraph = (locale: Locale, text: PageText, entries: GlossaryEntry[]) => {
  const url = localeUrl(locale, routes.glossary);
  return webPageGraph(locale, {
    ...text,
    path: routes.glossary,
    mainEntity: ref(glossaryId(url)),
    nodes: [definedTermSetNode({ locale, url, ...text, entries })],
  });
};

export const organizationPageGraph = (
  locale: Locale,
  input: PageText & { path: string; type: "AboutPage" | "ContactPage" },
) =>
  webPageGraph(locale, {
    ...input,
    mainEntity: ref(siteIds.organization),
    about: ref(siteIds.organization),
  });
