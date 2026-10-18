import type { ImageProps } from "next/image";

import type { ImageAsset } from "@/types/common";

export const blurProps = (
  image: Pick<ImageAsset, "placeholder">,
): Pick<ImageProps, "placeholder" | "blurDataURL"> =>
  image.placeholder ? { placeholder: "blur", blurDataURL: image.placeholder } : {};

const DENSE_PHONE = "(max-width: 40rem) and (min-resolution: 2.5dppx)";

export const FULL_WIDTH_SIZES = `${DENSE_PHONE} 70vw, 100vw`;
