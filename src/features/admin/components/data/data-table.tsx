import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { adminContent } from "../../content";

export interface Column<TRow> {
  key: string;
  header: string;
  cell: (row: TRow) => ReactNode;
  className?: string;
  mobile?: "primary" | "meta" | "hidden";
}

interface DataTableProps<TRow> {
  rows: readonly TRow[];
  columns: readonly Column<TRow>[];
  rowKey: (row: TRow) => string;
  actions?: (row: TRow) => ReactNode;
  caption: string;
  leading?: (row: TRow) => ReactNode;
  leadingHeader?: ReactNode;
  rowClassName?: (row: TRow) => string | undefined;
}

export function DataTable<TRow>({
  rows,
  columns,
  rowKey,
  actions,
  caption,
  leading,
  leadingHeader,
  rowClassName,
}: DataTableProps<TRow>) {
  const primary = columns.find((column) => column.mobile === "primary") ?? columns[0];
  const meta = columns.filter((column) => column !== primary && column.mobile !== "hidden");

  return (
    <>
      <div className="overflow-hidden card shadow-card max-md:hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-start">
                {leading && (
                  <th scope="col" className="w-12 px-4">
                    {leadingHeader}
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-start text-caption font-extrabold text-muted",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-end text-caption font-extrabold text-muted"
                  >
                    <span className="sr-only">{adminContent.common.actions}</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    "border-b border-line transition-colors last:border-0 hover:bg-sunken/40",
                    rowClassName?.(row),
                  )}
                >
                  {leading && <td className="px-4 py-3 align-middle">{leading(row)}</td>}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-4 py-3 align-middle text-body", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center justify-end gap-0.5">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className={cn("flex flex-col gap-3 card p-4 shadow-card", rowClassName?.(row))}
          >
            <div className="flex items-start gap-3">
              {leading?.(row)}
              <div className="min-w-0 flex-1">{primary?.cell(row)}</div>
            </div>
            {meta.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {meta.map((column) => (
                  <div key={column.key} className="flex min-w-0 flex-col gap-1">
                    <dt className="text-caption font-bold text-muted">{column.header}</dt>
                    <dd className="min-w-0 text-label text-body">{column.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actions && (
              <div className="-mb-1 flex items-center justify-end gap-0.5 border-t border-line pt-2">
                {actions(row)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
