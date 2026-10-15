"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TextAreaField } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Sheet } from "@/components/ui/sheet";
import { apiClient } from "@/lib/api-client";
import type { AdminWarrantyCode } from "@/types/admin";
import { warrantyCodeStatuses } from "@/types/admin";
import type { WarrantyCodeStatus } from "@/types/warranty";

import { adminContent } from "../../content";
import { useAdminMutation } from "../../lib/use-admin-mutation";

const copy = adminContent.warranty.statusSheet;
const { statuses } = adminContent;

interface StatusSheetProps {
  code: AdminWarrantyCode | null;
  onClose: () => void;
}

export function StatusSheet({ code, onClose }: StatusSheetProps) {
  const { run, pending } = useAdminMutation();
  const [status, setStatus] = useState<WarrantyCodeStatus>(code?.status ?? "active");
  const [note, setNote] = useState(code?.note ?? "");

  const submit = async () => {
    if (!code) return;
    const done = await run(
      () =>
        apiClient.api.admin["warranty-codes"]({ id: code.id }).status.patch({
          status,
          note: note.trim() || null,
        }),
      { success: copy.updated },
    );
    if (done) onClose();
  };

  return (
    <Sheet open={code !== null} onClose={onClose} title={copy.title}>
      {code && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 rounded-field bg-sunken/70 px-4 py-3">
            <span className="text-sm font-bold text-ink">{code.product.name.fa}</span>
            <bdi dir="ltr" className="font-code text-lg font-bold tracking-wider text-ink">
              {code.formatted}
            </bdi>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-label font-bold text-ink">{copy.status}</span>
            <SegmentedControl
              options={warrantyCodeStatuses.map((value) => ({
                value,
                label: statuses.warranty[value],
              }))}
              value={status}
              onChange={setStatus}
              label={copy.status}
              className="self-start"
            />
            {status !== "active" && (
              <p className="text-xs leading-6 text-warning">
                {status === "revoked" ? copy.revokeHint : copy.recallHint}
              </p>
            )}
          </div>
          <TextAreaField
            label={copy.note}
            hint={copy.noteHint}
            value={note}
            maxLength={300}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-20"
          />
          <Button
            onClick={() => void submit()}
            disabled={pending || (status === code.status && note === (code.note ?? ""))}
          >
            {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {copy.submit}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
