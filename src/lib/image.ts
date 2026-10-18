import type { ImageProps } from "next/image";

import type { ImageAsset } from "@/types/common";

export const blurProps = (
  image: Pick<ImageAsset, "placeholder">,
): Pick<ImageProps, "placeholder" | "blurDataURL"> =>
  image.placeholder ? { placeholder: "blur", blurDataURL: image.placeholder } : {};

const DENSE_PHONE = "(max-width: 40rem) and (min-resolution: 2.5dppx)";
const DENSE_PHONE_SHARE = 0.7;

export const phoneWidth = (vw: number) =>
  `${DENSE_PHONE} ${Math.round(vw * DENSE_PHONE_SHARE)}vw, ${vw}vw`;

export const FULL_WIDTH_SIZES = phoneWidth(100);
