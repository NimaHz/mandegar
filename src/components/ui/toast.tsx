"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import {
  AnimatePresence,
  m,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";

import { springSnappy } from "@/components/motion/easing";
import { useDictionary } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "info" | "danger";

export interface ToastAction {
  label: string;
  onClick?: () => void;
  href?: Route;
}

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: ToastAction;
  id?: string;
}

interface ToastItem {
  id: string;
  stamp: number;
  title: string;
  description: string | undefined;
  tone: ToastTone;
  duration: number;
  action: ToastAction | undefined;
  returnFocus: HTMLElement | null;
}

interface ToastState {
  items: ToastItem[];
  dismiss: (id: string) => void;
}

let nextId = 0;
const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;
const ACTION_DURATION = 6500;
const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 480;

const useToastStore = create<ToastState>()((set) => ({
  items: [],
  dismiss: (id) => set(({ items }) => ({ items: items.filter((item) => item.id !== id) })),
}));

export const dismissToast = (id: string) => useToastStore.getState().dismiss(id);

export const toast = ({
  title,
  description,
  tone = "success",
  duration,
  action,
  id,
}: ToastOptions) => {
  const stamp = ++nextId;
  const key = id ?? `toast-${stamp}`;
  const active = typeof document === "undefined" ? null : document.activeElement;
  const item: ToastItem = {
    id: key,
    stamp,
    title,
    description,
    tone,
    duration: duration ?? (action ? ACTION_DURATION : DEFAULT_DURATION),
    action,
    returnFocus: active instanceof HTMLElement && active !== document.body ? active : null,
  };
  useToastStore.setState(({ items }) => ({
    items: [...items.filter((entry) => entry.id !== key), item].slice(-MAX_VISIBLE),
  }));
  return key;
};

const toneMeta = {
  success: { icon: CircleCheck, tile: "bg-success-soft text-success" },
  info: { icon: Info, tile: "bg-primary-soft text-primary" },
  danger: { icon: CircleAlert, tile: "bg-danger-soft text-danger" },
} as const;

function useAutoDismiss(item: ToastItem, running: boolean, onDone: () => void) {
  const { duration, stamp } = item;
  const remaining = useRef({ stamp, ms: duration });

  useEffect(() => {
    if (remaining.current.stamp !== stamp) remaining.current = { stamp, ms: duration };
    if (duration <= 0 || !running) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(onDone, remaining.current.ms);
    return () => {
      window.clearTimeout(timer);
      remaining.current.ms -= Date.now() - startedAt;
    };
  }, [duration, stamp, running, onDone]);
}

function ToastCard({ item, dismissLabel }: { item: ToastItem; dismissLabel: string }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReducedMotion();
  const [swipe, setSwipe] = useState(0);
  const x = useMotionValue(0);
  const dragOpacity = useTransform(x, [-160, 0, 160], [0.25, 1, 0.25]);
  const meta = toneMeta[item.tone];
  const Icon = meta.icon;

  const close = () => dismiss(item.id);
  useAutoDismiss(item, !hovered && !focused, close);

  const runAction = () => {
    item.action?.onClick?.();
    close();
    if (item.returnFocus?.isConnected) item.returnFocus.focus({ preventScroll: true });
  };

  const onDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const travelled = Math.abs(info.offset.x) > SWIPE_DISTANCE;
    const flung = Math.abs(info.velocity.x) > SWIPE_VELOCITY;
    if (!travelled && !flung) return;
    setSwipe(Math.sign(info.offset.x || info.velocity.x));
    close();
  };

  const actionClass =
    "inline-flex h-8 shrink-0 items-center rounded-control px-2.5 text-label font-extrabold text-primary transition-colors hover:bg-primary-soft";

  return (
    <m.div
      layout={reduceMotion ? false : "position"}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        swipe === 0
          ? { opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.18 } }
          : { opacity: 0, x: swipe * 240, transition: { duration: 0.2 } }
      }
      transition={springSnappy}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      dragSnapToOrigin
      onDragEnd={onDragEnd}
      style={{ x }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
      className="pointer-events-auto w-full max-w-sm touch-pan-y select-none"
    >
      <m.div
        style={{ opacity: dragOpacity }}
        className="flex items-center gap-3 card bg-raised p-3 shadow-lift"
      >
        <span className={cn("icon-tile size-9", meta.tile)}>
          <Icon className="size-4.5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-extrabold text-ink">{item.title}</p>
          {item.description && (
            <p className="text-xs leading-5 text-pretty text-muted">{item.description}</p>
          )}
        </div>
        {item.action &&
          (item.action.href ? (
            <Link href={item.action.href} onClick={runAction} className={actionClass}>
              {item.action.label}
            </Link>
          ) : (
            <button type="button" onClick={runAction} className={actionClass}>
              {item.action.label}
            </button>
          ))}
        <button
          type="button"
          onClick={close}
          aria-label={dismissLabel}
          className="-me-1 icon-btn size-7 self-start"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </m.div>
    </m.div>
  );
}

export function Toaster() {
  const { ui } = useDictionary();
  const items = useToastStore((state) => state.items);

  return (
    <section
      aria-label={ui.toastRegion}
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-70 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pe-6"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} dismissLabel={ui.toastDismiss} />
        ))}
      </AnimatePresence>
    </section>
  );
}
