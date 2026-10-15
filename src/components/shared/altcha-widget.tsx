"use client";

import { type Challenge, solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/web/pbkdf2";
import { CircleAlert, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { useDictionary } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";

type AltchaStatus = "verifying" | "verified" | "error";

interface AltchaWidgetProps {
  name?: string;
  onChange?: (payload: string | null) => void;
  className?: string;
}

const REFRESH_MS = 9 * 60 * 1000;

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

export function AltchaWidget({ name = "altcha", onChange, className }: AltchaWidgetProps) {
  const { ui } = useDictionary();
  const [status, setStatus] = useState<AltchaStatus>("verifying");
  const [payload, setPayload] = useState("");
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const emit = useEffectEvent((value: string | null) => onChange?.(value));

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    let refresh = 0;

    const solve = async () => {
      try {
        const response = await fetch("/api/altcha/challenge", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`challenge ${response.status}`);
        const challenge: Challenge = await response.json();
        const solution = await solveChallenge({ challenge, deriveKey, controller });
        if (!solution) throw new Error("unsolved");
        const value = btoa(JSON.stringify({ challenge, solution }));
        setPayload(value);
        setStatus("verified");
        emit(value);
        refresh = window.setTimeout(() => setAttempt((count) => count + 1), REFRESH_MS);
      } catch (error) {
        if (isAbort(error)) return;
        setStatus("error");
        emit(null);
      }
    };

    void solve();
    return () => {
      controller.abort();
      window.clearTimeout(refresh);
    };
  }, [attempt]);

  const retry = () => {
    controllerRef.current?.abort();
    setPayload("");
    setStatus("verifying");
    onChange?.(null);
    setAttempt((count) => count + 1);
  };

  const label =
    status === "verified"
      ? ui.altchaVerified
      : status === "error"
        ? ui.altchaFailed
        : ui.altchaVerifying;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-field border px-3.5 py-3 transition-colors",
        status === "verified" && "border-success/30 bg-success-soft/50",
        status === "error" && "border-danger/30 bg-danger-soft/50",
        status === "verifying" && "border-line bg-surface",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full",
          status === "verified" && "bg-success text-white",
          status === "error" && "bg-danger text-white",
          status === "verifying" && "bg-primary-soft text-primary",
        )}
      >
        {status === "verified" ? (
          <ShieldCheck className="size-4.5" />
        ) : status === "error" ? (
          <CircleAlert className="size-4.5" />
        ) : (
          <LoaderCircle className="size-4.5 animate-spin" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5" role="status" aria-live="polite">
        <span className="text-sm font-bold text-ink">{label}</span>
        <span className="text-xs text-muted">{ui.altchaHint}</span>
      </span>
      {status === "error" && (
        <button
          type="button"
          onClick={retry}
          className="shrink-0 rounded-control px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
        >
          {ui.altchaRetry}
        </button>
      )}
      <input type="hidden" name={name} value={payload} />
    </div>
  );
}
