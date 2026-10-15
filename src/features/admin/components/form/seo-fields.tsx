import { adminContent } from "../../content";
import { LocalizedField, LocalizedTextarea } from "./localized-field";

const { common } = adminContent;

export function SeoFields({ name = "seo" }: { name?: string }) {
  return (
    <>
      <LocalizedField name={`${name}.title`} label={common.seoTitle} maxLength={80} />
      <LocalizedTextarea
        name={`${name}.description`}
        label={common.seoDescription}
        maxLength={200}
        rows={2}
      />
    </>
  );
}
