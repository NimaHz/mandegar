"use client";

import { ErrorScreen, type ErrorScreenProps } from "@/features/info/components/error-screen";

export default function SiteError({ error, retry }: ErrorScreenProps) {
  return <ErrorScreen error={error} retry={retry} />;
}
