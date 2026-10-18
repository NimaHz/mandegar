"use client";

import { type ReactNode, useEffect, useState } from "react";

let hydrated = false;

export default function SiteTemplate({ children }: { children: ReactNode }) {
  const [fade] = useState(() => hydrated);

  useEffect(() => {
    hydrated = true;
  }, []);

  return <div className={fade ? "animate-fade" : undefined}>{children}</div>;
}
