export const cacheTags = {
  catalog: "catalog",
  guides: "guides",
  posts: "posts",
  faqs: "faqs",
  slides: "slides",
  serviceCenters: "service-centers",
  settings: "settings",
  warranty: "warranty",
} as const;

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags];
