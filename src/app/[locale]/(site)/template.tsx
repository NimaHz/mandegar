import type { ReactNode } from "react";

export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-fade">{children}</div>;
}
