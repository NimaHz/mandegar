import type { LucideIcon } from "lucide-react";
import { Info, LifeBuoy, Package, ShieldCheck, Wrench } from "lucide-react";

import type { FaqGroup } from "@/types/content";

export const faqGroupIcons: Record<FaqGroup, LucideIcon> = {
  general: Info,
  warranty: ShieldCheck,
  installation: Wrench,
  products: Package,
  support: LifeBuoy,
};
