import Image from "next/image";

import { cn } from "@/lib/cn";
import type { AuthorSummary } from "@/types/content";

const sizes = {
  sm: { box: "size-9 text-sm", image: "36px" },
  md: { box: "size-12 text-base", image: "48px" },
  lg: { box: "size-16 text-xl", image: "64px" },
  xl: { box: "size-28 text-4xl sm:size-36", image: "144px" },
} as const;

interface AuthorAvatarProps {
  author: Pick<AuthorSummary, "name" | "avatar">;
  size?: keyof typeof sizes;
  priority?: boolean;
  className?: string;
}

export function AuthorAvatar({ author, size = "md", priority, className }: AuthorAvatarProps) {
  const { box, image } = sizes[size];

  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-deep font-display font-black text-white ring-1 ring-line",
        box,
        className,
      )}
    >
      {author.avatar ? (
        <Image
          src={author.avatar.src}
          alt=""
          fill
          sizes={image}
          loading={priority ? "eager" : "lazy"}
          className="object-cover"
        />
      ) : (
        author.name.charAt(0)
      )}
    </span>
  );
}
