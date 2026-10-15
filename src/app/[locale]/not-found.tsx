import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";

export default async function NotFound() {
  const locale = await getLocale();
  const { common } = await getDictionary(locale);

  return (
    <main className="bg-glow flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-display text-7xl leading-none font-black text-ink">
        {formatNumber(locale, 404, { useGrouping: false })}
      </p>
      <h1 className="text-xl font-extrabold text-ink">{common.notFoundTitle}</h1>
      <p className="max-w-sm text-sm leading-7 text-body">{common.notFoundDescription}</p>
      <Link href={localizePath(locale, "/")} className={buttonVariants()}>
        {common.backHome}
      </Link>
    </main>
  );
}
