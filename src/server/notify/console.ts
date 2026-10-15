import type { Notifier } from "./index";

export const createConsoleNotifier = (): Notifier => ({
  driver: "console",
  send: async (notification) => {
    process.stdout.write(
      `[sms] ${notification.template} → ${notification.recipient}: ${notification.tokens.join(" | ")}\n`,
    );
  },
});
