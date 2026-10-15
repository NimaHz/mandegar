import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ["2xs", "caption", "label", "lead"] },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
