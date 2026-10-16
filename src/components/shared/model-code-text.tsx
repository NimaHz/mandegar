export const MODEL_CODE = /\b([A-Z]+-\d[\dA-Z]*)\b/g;

export function ModelCodeText({ text }: { text: string }) {
  return text.split(MODEL_CODE).map((part, index) =>
    index % 2 === 1 ? (
      <bdi key={index} dir="ltr" className="whitespace-nowrap">
        {part}
      </bdi>
    ) : (
      part
    ),
  );
}
