import type { Metadata } from "next";

import { MessagesList } from "@/features/admin/components/messages/messages-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { messagesQuerySchema } from "@/server/modules/contact/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.messages.title };

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const { permissions } = await requireAdmin("messages:read");
  const params = await searchParams;
  const result = await adminApi.messages.list(messagesQuerySchema.parse(params));
  return (
    <MessagesList
      result={result}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("messages:write")}
    />
  );
}
