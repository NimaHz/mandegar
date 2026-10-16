import type { Metadata } from "next";

import { TicketsList } from "@/features/admin/components/tickets/tickets-list";
import { adminContent } from "@/features/admin/content";
import { getRequestTime, hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { ticketsQuerySchema } from "@/server/modules/tickets/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.tickets.title };

export default async function AdminTicketsPage({ searchParams }: PageProps<"/admin/tickets">) {
  await requireAdmin("tickets:read");
  const { scope, ...params } = await searchParams;
  const query = ticketsQuerySchema.parse(params);
  const [result, assignees] = await Promise.all([
    adminApi.tickets.list({
      ...query,
      open: !query.status && scope !== "all",
      breaching: scope === "breaching",
    }),
    adminApi.users.assignees(),
  ]);

  return (
    <TicketsList
      result={result}
      assignees={assignees}
      filtered={hasFilters({ ...params, scope })}
      now={getRequestTime()}
    />
  );
}
