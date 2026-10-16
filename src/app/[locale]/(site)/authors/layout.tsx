import type { ReactNode } from "react";

import { BlogGate } from "@/features/blog/blog-gate";

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <BlogGate>{children}</BlogGate>;
}
