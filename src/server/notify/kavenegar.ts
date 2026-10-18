import { z } from "@/lib/zod";

import type { NotificationTemplate, Notifier } from "./index";

const TIMEOUT_MS = 5_000;

const responseSchema = z.object({ return: z.object({ status: z.number(), message: z.string() }) });

const tokenKeys = ["token", "token2", "token3"] as const;

const sanitizeToken = (value: string) => value.replace(/\s+/g, "-").slice(0, 100);

export const createKavenegarNotifier = (
  apiKey: string,
  templates: Record<NotificationTemplate, string>,
): Notifier => ({
  driver: "kavenegar",
  send: async (notification) => {
    const url = new URL(
      `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/verify/lookup.json`,
    );
    url.searchParams.set("receptor", notification.recipient);
    url.searchParams.set("template", templates[notification.template]);
    notification.tokens.slice(0, tokenKeys.length).forEach((token, index) => {
      const key = tokenKeys[index];
      if (key) url.searchParams.set(key, sanitizeToken(token));
    });
    const response = await fetch(url, { method: "POST", signal: AbortSignal.timeout(TIMEOUT_MS) });
    const parsed = responseSchema.safeParse(await response.json().catch(() => null));
    if (!response.ok || !parsed.success || parsed.data.return.status !== 200) {
      throw new Error(
        `Kavenegar request failed with status ${parsed.success ? parsed.data.return.status : response.status}`,
      );
    }
  },
});
