import type { ImageProps } from "next/image";

import type { ImageAsset } from "@/types/common";

/** Spread into `<Image>` to paint the stored blur while the real file loads. */
export const blurProps = (
  image: Pick<ImageAsset, "placeholder">,
): Pick<ImageProps, "placeholder" | "blurDataURL"> =>
  image.placeholder ? { placeholder: "blur", blurDataURL: image.placeholder } : {};
