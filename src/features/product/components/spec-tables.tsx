import { EnergyBadge } from "@/features/catalog/components/energy-badge";
import { isEnergyClass } from "@/features/catalog/filters";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { SpecGroup, SpecItem } from "@/types/catalog";

interface SpecTablesProps {
  groups: SpecGroup[];
  locale: Locale;
  labelHeader: string;
}

const specValue = (locale: Locale, item: SpecItem) =>
  item.numeric !== null ? formatNumber(locale, item.numeric) : item.value;

export function SpecValue({ item, locale }: { item: SpecItem; locale: Locale }) {
  if (isEnergyClass(item.value)) return <EnergyBadge value={item.value} label={item.value} />;
  const isCode = /^[A-Z0-9+\-./ ]+$/.test(item.value) && item.numeric === null;
  return (
    <>
      {isCode ? (
        <bdi dir="ltr" className="font-code font-bold">
          {item.value}
        </bdi>
      ) : (
        <span className="font-bold">{specValue(locale, item)}</span>
      )}
      {item.unit && <span className="ms-1.5 text-xs font-semibold text-muted">{item.unit}</span>}
    </>
  );
}

export function SpecTables({ groups, locale, labelHeader }: SpecTablesProps) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      {groups.map((group, index) => (
        <div
          key={group.title}
          className={cn(
            "overflow-hidden card shadow-card",
            groups.length % 2 === 1 && index === groups.length - 1 && "lg:col-span-2",
          )}
        >
          <table className="w-full border-collapse text-sm">
            <caption className="border-b border-line bg-raised px-5 py-3.5 text-start text-base font-extrabold text-ink">
              {group.title}
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">{labelHeader}</th>
                <th scope="col">{group.title}</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item) => (
                <tr key={item.key} className="even:bg-sunken/70">
                  <th
                    scope="row"
                    className="w-[46%] px-5 py-3.5 text-start align-top font-semibold text-body"
                  >
                    {item.label}
                  </th>
                  <td className="px-5 py-3.5 align-top text-ink">
                    <SpecValue item={item} locale={locale} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
