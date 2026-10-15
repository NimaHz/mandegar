import { cn } from "@/lib/cn";

import { initials } from "../../lib/format";

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-inverse font-display text-sm font-black text-on-inverse",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
