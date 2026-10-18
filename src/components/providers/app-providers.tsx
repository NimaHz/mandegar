import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { MotionProvider } from "@/components/motion/motion-provider";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { Toaster, type ToastPlacement } from "@/components/ui/toast";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fa";
import { LocaleProvider } from "@/i18n/locale-provider";

import { StoreHydrator } from "./store-hydrator";
import { ThemeColor } from "./theme-color";

interface AppProvidersProps {
  locale: Locale;
  dictionary: Dictionary;
  toastPlacement?: ToastPlacement;
  children: ReactNode;
}

export function AppProviders({ locale, dictionary, toastPlacement, children }: AppProvidersProps) {
  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <NuqsAdapter>
        <MotionProvider>
          <StoreHydrator />
          <ThemeColor />
          <ServiceWorkerRegistrar />
          {children}
          <Toaster placement={toastPlacement} />
        </MotionProvider>
      </NuqsAdapter>
    </LocaleProvider>
  );
}
