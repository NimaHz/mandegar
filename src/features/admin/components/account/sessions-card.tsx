"use client";

import { LoaderCircle, LogOut, Monitor, Smartphone } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { formatDateTime } from "@/lib/dates";
import { adminRoutes } from "@/lib/routes";
import type { AdminSession } from "@/types/admin";

import { adminContent } from "../../content";
import { toApiError } from "../../lib/api-error";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { StatusBadge } from "../data/status-badge";
import { PanelCard } from "../panel-card";

const copy = adminContent.account.sessions;

const deviceOf = (agent: string | null) => {
  if (!agent) return { label: copy.unknownDevice, mobile: false };
  const browser = /Edg\//.test(agent)
    ? "Edge"
    : /Firefox\//.test(agent)
      ? "Firefox"
      : /Chrome\//.test(agent)
        ? "Chrome"
        : /Safari\//.test(agent)
          ? "Safari"
          : null;
  const os = /Android/.test(agent)
    ? "Android"
    : /iPhone|iPad/.test(agent)
      ? "iOS"
      : /Windows/.test(agent)
        ? "Windows"
        : /Mac OS/.test(agent)
          ? "macOS"
          : /Linux/.test(agent)
            ? "Linux"
            : null;
  return {
    label: [browser, os].filter(Boolean).join(" · ") || copy.unknownDevice,
    mobile: /Mobile|Android|iPhone/.test(agent),
  };
};

export function SessionsCard() {
  const router = useRouter();
  const { run } = useAdminMutation();
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiClient.api.auth.sessions
      .get()
      .catch(() => null)
      .then((result) => {
        if (cancelled) return;
        if (result?.data) setSessions(result.data);
        else setLoadError(toApiError(result?.error ?? null).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const drop = (id: string) =>
    setSessions((current) => current?.filter((item) => item.id !== id) ?? null);

  const revoke = async (session: AdminSession) => {
    setRevoking(session.id);
    await run(() => apiClient.api.auth.sessions({ id: session.id }).delete(), {
      success: copy.revoked,
      refresh: false,
      onSuccess: (result) => {
        if (result.current) {
          router.replace(adminRoutes.login as Route);
          return;
        }
        drop(session.id);
      },
      onError: (error) => {
        if (error.code === "NOT_FOUND") drop(session.id);
      },
    });
    setRevoking(null);
  };

  return (
    <PanelCard title={copy.title} icon={Monitor} description={copy.hint}>
      {loadError ? (
        <p role="alert" className="text-sm font-semibold text-danger">
          {loadError}
        </p>
      ) : sessions === null ? (
        <LoaderCircle className="size-5 animate-spin text-muted" aria-hidden />
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => {
              const device = deviceOf(session.userAgent);
              const Icon = device.mobile ? Smartphone : Monitor;
              return (
                <li
                  key={session.id}
                  className="flex items-center gap-3 rounded-field border border-line p-3"
                >
                  <span className="icon-tile size-10 bg-sunken text-ink-soft">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink">
                      <bdi dir="ltr">{device.label}</bdi>
                      {session.current && <StatusBadge tone="success" label={copy.current} />}
                    </span>
                    <span className="text-caption text-muted">
                      {fill(copy.lastSeen, { date: formatDateTime("fa", session.lastSeenAt) })}
                      {session.ip && (
                        <>
                          {" · "}
                          <bdi dir="ltr" className="font-code">
                            {session.ip}
                          </bdi>
                        </>
                      )}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void revoke(session)}
                    disabled={revoking !== null}
                    aria-busy={revoking === session.id}
                    className="inline-flex h-9 items-center gap-1.5 rounded-control px-3 text-xs font-bold text-danger transition-colors hover:bg-danger-soft disabled:opacity-60"
                  >
                    {revoking === session.id ? (
                      <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <LogOut className="size-4 -scale-x-100" aria-hidden />
                    )}
                    {copy.revoke}
                  </button>
                </li>
              );
            })}
          </ul>
          {sessions.every((session) => session.current) && (
            <p className="text-xs text-muted">{copy.empty}</p>
          )}
        </>
      )}
    </PanelCard>
  );
}
