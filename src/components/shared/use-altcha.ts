"use client";

import type { Challenge } from "altcha-lib";
import { useEffect, useState } from "react";

import { apiClient, apiResult } from "@/lib/api-client";

export type AltchaStatus = "idle" | "verifying" | "verified" | "error";

export interface AltchaState {
  status: AltchaStatus;
  payload: string | null;
  renew: () => void;
}

interface AltchaOutcome {
  attempt: number;
  payload: string | null;
}

const REFRESH_MS = 9 * 60 * 1000;
const MAX_WORKERS = 4;

const createWorker = () =>
  new Worker(new URL("./altcha-worker.ts", import.meta.url), { type: "module" });

const solve = async (challenge: Challenge, controller: AbortController) => {
  const [{ solveChallenge, solveChallengeWorkers }, { deriveKey }] = await Promise.all([
    import("altcha-lib"),
    import("altcha-lib/algorithms/web/pbkdf2"),
  ]);
  const inline = () => solveChallenge({ challenge, deriveKey, controller });
  if (typeof Worker === "undefined") return inline();
  return solveChallengeWorkers({
    challenge,
    controller,
    concurrency: Math.min(navigator.hardwareConcurrency || 1, MAX_WORKERS),
    createWorker,
  }).catch(inline);
};

export function useAltcha(enabled = true): AltchaState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<AltchaOutcome | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let refresh = 0;

    const run = async () => {
      const challenge = await apiResult(
        apiClient.api.altcha.challenge.get({
          fetch: { signal: controller.signal, cache: "no-store" },
        }),
      );
      const solution = challenge.ok
        ? await solve(challenge.data, controller).catch(() => null)
        : null;
      if (controller.signal.aborted) return;
      setOutcome({
        attempt,
        payload:
          challenge.ok && solution
            ? btoa(JSON.stringify({ challenge: challenge.data, solution }))
            : null,
      });
      if (solution) refresh = window.setTimeout(() => setAttempt((count) => count + 1), REFRESH_MS);
    };

    void run();
    return () => {
      controller.abort();
      window.clearTimeout(refresh);
    };
  }, [enabled, attempt]);

  const current = enabled && outcome?.attempt === attempt ? outcome : null;
  return {
    status: !enabled ? "idle" : !current ? "verifying" : current.payload ? "verified" : "error",
    payload: current?.payload ?? null,
    renew: () => setAttempt((count) => count + 1),
  };
}
