import { llmsFullText, textResponse } from "@/lib/seo/llms";
import { getSiteSnapshot } from "@/lib/seo/snapshot";

export const revalidate = 3600;

export async function GET() {
  return textResponse(llmsFullText(await getSiteSnapshot()));
}
