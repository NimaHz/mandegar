import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getLocale } from "@/i18n/get-locale";
import { api } from "@/services";

export async function BlogGate({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const { features } = await api.content.settings(locale);
  if (!features.blog) notFound();
  return children;
}
