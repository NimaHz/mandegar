"use client";

import { LoaderCircle, Send } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextAreaField } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import type { Locale } from "@/i18n/config";
import { postMultipart } from "@/lib/api-client";
import type { PublicTicket } from "@/types/support";

import type { TrackContent } from "../../content";
import { type AttachmentLabels, AttachmentPicker } from "../attachment-picker";

interface ReplyFormProps {
  locale: Locale;
  trackingCode: string;
  token: string;
  copy: TrackContent["reply"];
  attachmentLabels: AttachmentLabels;
  onReplied: (ticket: PublicTicket) => void;
}

const MAX_LENGTH = 3000;

export function ReplyForm({
  locale,
  trackingCode,
  token,
  copy,
  attachmentLabels,
  onReplied,
}: ReplyFormProps) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) {
      setError(copy.empty);
      return;
    }
    setSending(true);
    setError(undefined);
    setFileError(undefined);
    const data = new FormData();
    data.append("token", token);
    data.append("body", body.trim());
    data.append("locale", locale);
    for (const file of files) data.append("attachments", file);
    const result = await postMultipart<PublicTicket>(
      `/api/tickets/${encodeURIComponent(trackingCode)}/messages`,
      data,
    );
    setSending(false);
    if (!result.ok) {
      if (result.code === "PAYLOAD_TOO_LARGE" || result.code === "UNSUPPORTED_MEDIA") {
        setFileError(result.code === "PAYLOAD_TOO_LARGE" ? copy.tooLarge : copy.fileType);
        return;
      }
      setError(
        result.code === "CONFLICT"
          ? copy.closed
          : result.code === "RATE_LIMITED"
            ? copy.rateLimited
            : copy.generic,
      );
      return;
    }
    setBody("");
    setFiles([]);
    onReplied(result.data);
    toast({ title: copy.sent });
  };

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
      <TextAreaField
        label={copy.label}
        rows={4}
        maxLength={MAX_LENGTH}
        placeholder={copy.placeholder}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          if (error) setError(undefined);
        }}
        error={error}
      />
      <AttachmentPicker
        files={files}
        onChange={(next) => {
          setFiles(next);
          setFileError(undefined);
        }}
        labels={attachmentLabels}
        error={fileError}
      />
      <Button type="submit" size="lg" disabled={sending} className="self-end max-sm:w-full">
        {sending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
            {copy.sending}
          </>
        ) : (
          <>
            <Send className="size-4.5 rtl:-scale-x-100" aria-hidden />
            {copy.submit}
          </>
        )}
      </Button>
    </form>
  );
}
