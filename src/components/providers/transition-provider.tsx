"use client";

import {
  createContext,
  type ReactNode,
  type TransitionStartFunction,
  use,
  useTransition,
} from "react";

import { cn } from "@/lib/cn";

interface TransitionContextValue {
  isPending: boolean;
  startTransition: TransitionStartFunction;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();

  return <TransitionContext value={{ isPending, startTransition }}>{children}</TransitionContext>;
}

export function useSharedTransition() {
  const context = use(TransitionContext);
  if (!context) throw new Error("useSharedTransition must be used within TransitionProvider");
  return context;
}

interface PendingRegionProps {
  children: ReactNode;
  className?: string;
}

export function PendingRegion({ children, className }: PendingRegionProps) {
  const { isPending } = useSharedTransition();

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "transition-[opacity,filter] duration-300",
        isPending && "pointer-events-none opacity-55 blur-[1px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
