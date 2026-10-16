import type { ImageAsset } from "@/types/common";

import { absoluteUrl } from "../urls";
import type { JsonLdNode } from "./types";

export const imageObject = (image: ImageAsset | string): JsonLdNode => {
  const asset = typeof image === "string" ? { src: image } : image;
  const url = absoluteUrl(asset.src);
  return {
    "@type": "ImageObject",
    url,
    contentUrl: url,
    width: "width" in asset ? asset.width || null : null,
    height: "height" in asset ? asset.height || null : null,
    caption: "alt" in asset ? asset.alt || null : null,
  };
};
