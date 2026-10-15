"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { Pagination } from "@/components/ui/pagination";
import { fill } from "@/i18n/fill";
import { useDictionary } from "@/i18n/locale-provider";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";

interface ListPaginationProps {
  page: number;
  pageCount: number;
  total: number;
}

export function ListPagination({ page, pageCount, total }: ListPaginationProps) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { ui } = useDictionary();

  const createHref = (target: number) => {
    const query = Object.fromEntries(params.entries());
    if (target > 1) query.page = String(target);
    else delete query.page;
    return { pathname, query };
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p role="status" className="text-xs font-bold text-muted">
        {fill(adminContent.common.results, { count: faNumber(total) })}
        {pageCount > 1 && (
          <>
            {" · "}
            {fill(adminContent.common.page, { page: faNumber(page), total: faNumber(pageCount) })}
          </>
        )}
      </p>
      <Pagination
        page={page}
        pageCount={pageCount}
        createHref={createHref}
        locale="fa"
        labels={ui}
      />
    </div>
  );
}
