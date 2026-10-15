import { Markdown } from "@/components/shared/markdown";

interface ProductOverviewProps {
  summary: string;
  description: string;
}

const withoutLead = (description: string, summary: string) => {
  const trimmed = description.trim();
  return summary && trimmed.startsWith(summary.trim())
    ? trimmed.slice(summary.trim().length).trim()
    : trimmed;
};

export function ProductOverview({ summary, description }: ProductOverviewProps) {
  const body = withoutLead(description, summary);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
      <p className="font-display text-xl leading-[1.75] font-bold text-balance text-ink sm:text-2xl sm:leading-[1.7] lg:sticky lg:top-40 lg:self-start">
        <span aria-hidden className="mb-4 block h-1 w-12 rounded-full bg-accent" />
        {summary}
      </p>
      {body && <Markdown source={body} className="max-w-none [&>:first-child]:mt-0" />}
    </div>
  );
}
