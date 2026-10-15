import type { JsonLdGraph } from "@/lib/seo/jsonld/types";

interface JsonLdProps {
  data: JsonLdGraph;
}

const serialize = (data: JsonLdGraph) =>
  JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll(" ", "\\u2028")
    .replaceAll(" ", "\\u2029");

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(data) }} />
  );
}
