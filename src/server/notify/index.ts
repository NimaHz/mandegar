import "server-only";

import { getDb } from "@/server/db/client";
import { notificationOutbox } from "@/server/db/schema";
import { getServerEnv } from "@/server/env";
import type { NotificationStatus } from "@/types/admin";

import { createConsoleNotifier } from "./console";
import { createKavenegarNotifier } from "./kavenegar";

export type NotificationTemplate = "ticket-received" | "ticket-updated";

export interface Notification {
  template: NotificationTemplate;
  recipient: string;
  tokens: string[];
}

export interface Notifier {
  driver: string;
  send: (notification: Notification) => Promise<void>;
}

let notifier: Notifier | null | undefined;

const createNotifier = (): Notifier | null => {
  const env = getServerEnv();
  if (env.SMS_DRIVER === "none") return null;
  if (env.SMS_DRIVER === "kavenegar") {
    if (!env.KAVENEGAR_API_KEY)
      throw new Error("KAVENEGAR_API_KEY is required for SMS_DRIVER=kavenegar");
    return createKavenegarNotifier(env.KAVENEGAR_API_KEY, {
      "ticket-received": env.KAVENEGAR_TEMPLATE_TICKET_RECEIVED,
      "ticket-updated": env.KAVENEGAR_TEMPLATE_TICKET_UPDATED,
    });
  }
  return createConsoleNotifier();
};

const record = async (
  notification: Notification,
  driver: string,
  status: NotificationStatus,
  error: string | null = null,
) => {
  await getDb()
    .insert(notificationOutbox)
    .values({
      channel: "sms",
      driver,
      recipient: notification.recipient,
      template: notification.template,
      payload: { tokens: notification.tokens },
      status,
      error,
    })
    .catch((failure: unknown) => console.error(failure));
};

export const notify = async (notification: Notification) => {
  if (notifier === undefined) notifier = createNotifier();
  if (!notifier) {
    await record(notification, "none", "skipped");
    return;
  }
  try {
    await notifier.send(notification);
    await record(notification, notifier.driver, "sent");
  } catch (error) {
    await record(
      notification,
      notifier.driver,
      "failed",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
};
