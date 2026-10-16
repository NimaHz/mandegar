import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TicketDetail } from "@/features/admin/components/tickets/ticket-detail";
import { adminContent } from "@/features/admin/content";
import { getRequestTime } from "@/features/admin/data";
import { hasAdminPermission, requireAdmin } from "@/server/auth/session";
import { idSchema } from "@/server/lib/validation";
import { adminApi } from "@/services/admin";

export async function generateMetadata({
  params,
}: PageProps<"/admin/tickets/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ticket =
    idSchema.safeParse(id).success && (await hasAdminPermission("tickets:read"))
      ? await adminApi.tickets.get(id)
      : null;
  return {
    title: ticket
      ? `${ticket.formattedTrackingCode} · ${ticket.subject}`
      : adminContent.tickets.title,
  };
}

export default async function AdminTicketPage({ params }: PageProps<"/admin/tickets/[id]">) {
  const { permissions } = await requireAdmin("tickets:read");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const [ticket, assignees] = await Promise.all([
    adminApi.tickets.get(id),
    adminApi.users.assignees(),
  ]);
  if (!ticket) notFound();

  return (
    <TicketDetail
      ticket={ticket}
      assignees={assignees}
      canWrite={permissions.includes("tickets:write")}
      canViewWarranty={permissions.includes("warranty:read")}
      now={getRequestTime()}
    />
  );
}
