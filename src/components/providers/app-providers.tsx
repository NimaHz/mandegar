import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { MotionProvider } from "@/components/motion/motion-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { Toaster } from "@/components/ui/toast";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fa";
import { LocaleProvider } from "@/i18n/locale-provider";

import { StoreHydrator } from "./store-hydrator";

interface AppProvidersProps {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}

export function AppProviders({ locale, dictionary, children }: AppProvidersProps) {
  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <NuqsAdapter>
        <MotionProvider>
          <SmoothScroll />
          <StoreHydrator />
          <ServiceWorkerRegistrar />
          {children}
          <Toaster />
        </MotionProvider>
      </NuqsAdapter>
    </LocaleProvider>
  );
}
