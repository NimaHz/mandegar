"use client";

import { LoaderCircle, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";

import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { QrCode } from "@/components/ui/qr-code";
import { apiClient } from "@/lib/api-client";
import { groupCode } from "@/lib/codes";
import { toLatinDigits } from "@/lib/persian";

import { adminContent } from "../../content";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { StatusBadge } from "../data/status-badge";
import { PanelCard } from "../panel-card";

const copy = adminContent.account.totp;

const digits = (value: string) => toLatinDigits(value).replace(/\D/g, "").slice(0, 6);

export function TotpCard({ enabled }: { enabled: boolean }) {
  const { run, pending } = useAdminMutation();
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  const start = () =>
    void run(() => apiClient.api.auth.totp.setup.post(), { refresh: false, onSuccess: setSetup });

  const enable = async () => {
    const done = await run(() => apiClient.api.auth.totp.enable.post({ password, code }), {
      success: copy.enabledToast,
    });
    if (done) {
      setSetup(null);
      setCode("");
      setPassword("");
    }
  };

  const disable = async () => {
    const done = await run(() => apiClient.api.auth.totp.disable.post({ password, code }), {
      success: copy.disabledToast,
    });
    if (done) {
      setDisabling(false);
      setCode("");
      setPassword("");
    }
  };

  const passwordField = (
    <Field
      label={adminContent.account.password.current}
      type="password"
      dir="ltr"
      autoComplete="current-password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
    />
  );

  const codeField = (
    <Field
      label={copy.code}
      inputMode="numeric"
      autoComplete="one-time-code"
      dir="ltr"
      maxLength={6}
      value={code}
      onChange={(event) => setCode(digits(event.target.value))}
      className="text-center font-code text-lg tracking-[0.5em]"
    />
  );

  return (
    <PanelCard
      title={copy.title}
      icon={ShieldCheck}
      action={
        <StatusBadge
          tone={enabled ? "success" : "chip"}
          label={enabled ? copy.enabled : copy.disabled}
        />
      }
    >
      <p className="text-xs leading-6 text-muted">{copy.intro}</p>
      {!enabled && !setup && (
        <Button onClick={start} disabled={pending} className="self-start">
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <ShieldCheck className="size-4" aria-hidden />
          )}
          {copy.start}
        </Button>
      )}
      {!enabled && setup && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0 self-center rounded-card border border-line bg-white p-2.5 shadow-card">
            <QrCode value={setup.uri} label={copy.qr} className="size-40" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="text-xs leading-6 text-body">{copy.scan}</p>
            <div className="flex items-center gap-2 rounded-field bg-sunken/70 p-2 ps-3">
              <span className="text-caption font-bold text-muted">{copy.secret}</span>
              <bdi
                dir="ltr"
                className="min-w-0 flex-1 truncate font-code text-sm font-bold tracking-wider text-ink"
              >
                {groupCode(setup.secret, 4)}
              </bdi>
              <CopyButton value={setup.secret} label={copy.secret} className="size-8" />
            </div>
            {passwordField}
            {codeField}
            <div className="flex gap-2">
              <Button
                onClick={() => void enable()}
                disabled={!password || code.length !== 6 || pending}
              >
                {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
                {copy.verify}
              </Button>
              <Button variant="soft" onClick={() => setSetup(null)}>
                {copy.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
      {enabled && !disabling && (
        <Button variant="line" onClick={() => setDisabling(true)} className="self-start">
          <ShieldOff className="size-4" aria-hidden />
          {copy.disable}
        </Button>
      )}
      {enabled && disabling && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted">{copy.disableHint}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {passwordField}
            {codeField}
          </div>
          <div className="flex gap-2">
            <Button
              variant="dark"
              onClick={() => void disable()}
              disabled={!password || code.length !== 6 || pending}
            >
              {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {copy.disable}
            </Button>
            <Button variant="soft" onClick={() => setDisabling(false)}>
              {copy.cancel}
            </Button>
          </div>
        </div>
      )}
    </PanelCard>
  );
}
