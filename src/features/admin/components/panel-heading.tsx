import type { ReactNode } from "react";

interface PanelHeadingProps {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function PanelHeading({ title, eyebrow, description, action }: PanelHeadingProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <span className="text-xs font-extrabold text-primary">{eyebrow}</span>}
        <h1 className="font-display text-[1.625rem] leading-tight font-black text-balance text-ink sm:text-[1.875rem]">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-7 text-pretty text-body">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}
