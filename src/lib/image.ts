import type { ImageProps } from "next/image";

import type { ImageAsset } from "@/types/common";

export const blurProps = (
  image: Pick<ImageAsset, "placeholder">,
): Pick<ImageProps, "placeholder" | "blurDataURL"> =>
  image.placeholder ? { placeholder: "blur", blurDataURL: image.placeholder } : {};
