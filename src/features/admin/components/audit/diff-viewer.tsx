import type { JsonValue } from "@/types/admin";

interface DiffViewerProps {
  value: JsonValue;
  empty: string;
}

function Leaf({ value }: { value: JsonValue }) {
  if (value === null) return <span className="text-muted">null</span>;
  if (typeof value === "boolean")
    return <span className="font-bold text-primary">{String(value)}</span>;
  if (typeof value === "number")
    return <span className="font-bold text-accent-strong">{value}</span>;
  if (typeof value === "string")
    return (
      <span dir="auto" className="break-words whitespace-pre-wrap text-ink">
        {value}
      </span>
    );
  return null;
}

function Node({ value }: { value: JsonValue }) {
  if (value === null || typeof value !== "object") return <Leaf value={value} />;
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);
  if (entries.length === 0)
    return <span className="text-muted">{Array.isArray(value) ? "[]" : "{}"}</span>;
  return (
    <dl className="flex flex-col gap-1 border-s border-line ps-3">
      {entries.map(([key, item]) => (
        <div key={key} className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:gap-2">
          <dt className="shrink-0 font-bold text-muted">{key}</dt>
          <dd className="min-w-0 flex-1">
            <Node value={item} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DiffViewer({ value, empty }: DiffViewerProps) {
  if (value === null || (typeof value === "object" && Object.keys(value).length === 0))
    return <p className="text-xs text-muted">{empty}</p>;
  return (
    <div
      dir="ltr"
      className="max-h-[50dvh] overflow-auto rounded-field border border-line bg-raised p-3 text-start font-code text-xs leading-6"
      data-lenis-prevent
    >
      <Node value={value} />
    </div>
  );
}
