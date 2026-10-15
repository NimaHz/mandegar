import {
  createLoader,
  createSerializer,
  type inferParserType,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";

import { postKinds } from "@/types/content";

export const blogSearchParams = {
  kind: parseAsStringLiteral(postKinds),
  page: parseAsInteger.withDefault(1),
};

export type BlogFilters = inferParserType<typeof blogSearchParams>;

export const loadBlogSearchParams = createLoader(blogSearchParams);

export const serializeBlogSearchParams = createSerializer(blogSearchParams);
