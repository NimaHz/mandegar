"use client";

import { useEffect, useEffectEvent } from "react";

import { toast } from "@/components/ui/toast";
import { useLocale } from "@/i18n/locale-provider";

import { pwaContent } from "./content";

const UPDATE_TOAST_ID = "sw-update";

export function ServiceWorkerRegistrar() {
  const locale = useLocale();

  const announce = useEffectEvent((worker: ServiceWorker, onAccept: () => void) => {
    const content = pwaContent[locale];
    toast({
      id: UPDATE_TOAST_ID,
      tone: "info",
      title: content.updateTitle,
      description: content.updateDescription,
      duration: 0,
      action: {
        label: content.updateAction,
        onClick: () => {
          onAccept();
          worker.postMessage({ type: "SKIP_WAITING" });
        },
      },
    });
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const { serviceWorker } = navigator;
    let accepted = false;
    let registration: ServiceWorkerRegistration | undefined;

    const accept = () => {
      accepted = true;
    };
    const offer = (worker: ServiceWorker | null) => {
      if (worker && serviceWorker.controller) announce(worker, accept);
    };
    const track = (worker: ServiceWorker | null) => {
      worker?.addEventListener("statechange", () => {
        if (worker.state === "installed") offer(worker);
      });
    };
    const onUpdateFound = () => track(registration?.installing ?? null);
    const onControllerChange = () => {
      if (accepted) window.location.reload();
    };

    serviceWorker.addEventListener("controllerchange", onControllerChange);
    void serviceWorker.register("/sw.js", { scope: "/" }).then((registered) => {
      registration = registered;
      offer(registered.waiting);
      registered.addEventListener("updatefound", onUpdateFound);
    });

    return () => {
      serviceWorker.removeEventListener("controllerchange", onControllerChange);
      registration?.removeEventListener("updatefound", onUpdateFound);
    };
  }, []);

  return null;
}
