import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Boxes,
  FileClock,
  LifeBuoy,
  Mail,
  Plus,
  QrCode,
  ShieldCheck,
  TriangleAlert,
  Video,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { fill } from "@/i18n/fill";
import { formatDate, formatDateTime } from "@/lib/dates";
import { adminRoutes } from "@/lib/routes";
import type { AdminAuditLog, AdminIdentity, DashboardStats } from "@/types/admin";

import { adminContent } from "../../content";
import { faBytes, faNumber } from "../../lib/format";
import { auditActionLabel, auditEntityLabel } from "../audit/audit-labels";
import { CodeText } from "../data/thumb-cell";
import { CardLink, PanelCard } from "../panel-card";
import { PanelHeading } from "../panel-heading";
import { UserAvatar } from "../shell/user-avatar";
import { StatGrid } from "../stat-tile";
import { PriorityBadge, SlaIndicator, TicketStatusBadge } from "../tickets/ticket-badges";

const copy = adminContent.dashboard;

interface AdminDashboardProps {
  user: AdminIdentity;
  stats: DashboardStats;
  audit: AdminAuditLog[] | null;
  now: number;
}

interface QuickAction {
  href: Route;
  label: string;
  hint: string;
  icon: LucideIcon;
  visible: boolean;
}

export function AdminDashboard({ user, stats, audit, now }: AdminDashboardProps) {
  const can = (permission: AdminIdentity["permissions"][number]) =>
    user.permissions.includes(permission);
  const actions: QuickAction[] = [
    {
      href: adminRoutes.newProduct,
      label: copy.actions.product,
      hint: copy.actions.productHint,
      icon: Boxes,
      visible: can("catalog:write"),
    },
    {
      href: `${adminRoutes.warranty}?generate=true` as Route,
      label: copy.actions.code,
      hint: copy.actions.codeHint,
      icon: QrCode,
      visible: can("warranty:write"),
    },
    {
      href: adminRoutes.newGuide,
      label: copy.actions.guide,
      hint: copy.actions.guideHint,
      icon: Video,
      visible: can("content:write"),
    },
    {
      href: adminRoutes.tickets,
      label: copy.actions.ticket,
      hint: copy.actions.ticketHint,
      icon: LifeBuoy,
      visible: can("tickets:read"),
    },
  ];
  const catalogRows = [
    { label: copy.catalogRows.categories, value: faNumber(stats.categories) },
    { label: copy.catalogRows.brands, value: faNumber(stats.brands) },
    { label: copy.catalogRows.drafts, value: faNumber(stats.products.draft) },
    { label: copy.catalogRows.archived, value: faNumber(stats.products.archived) },
    { label: copy.catalogRows.media, value: faNumber(stats.media.count) },
    { label: copy.catalogRows.storage, value: faBytes(stats.media.bytes) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PanelHeading
        eyebrow={fill(copy.today, {
          date: formatDate("fa", new Date(now), { weekday: "long", day: "numeric", month: "long" }),
        })}
        title={fill(copy.greeting, { name: user.name.split(" ")[0] ?? user.name })}
        description={copy.description}
        action={
          can("catalog:write") && (
            <Link
              href={adminRoutes.newProduct}
              className="inline-flex h-11 items-center gap-2 rounded-control bg-primary px-5 text-sm font-bold text-on-primary transition-colors hover:bg-primary-strong"
            >
              <Plus className="size-4" aria-hidden />
              {copy.actions.product}
            </Link>
          )
        }
      />

      <StatGrid
        className="xl:grid-cols-5"
        items={[
          {
            label: copy.stats.published,
            value: faNumber(stats.products.published),
            caption: fill(copy.stats.publishedCaption, { draft: faNumber(stats.products.draft) }),
            icon: Boxes,
            href: can("catalog:read") ? adminRoutes.products : undefined,
          },
          {
            label: copy.stats.openTickets,
            value: faNumber(stats.tickets.open),
            caption: fill(copy.stats.openTicketsCaption, { today: faNumber(stats.tickets.today) }),
            icon: LifeBuoy,
            tone: "bg-chip text-ink",
            href: can("tickets:read") ? adminRoutes.tickets : undefined,
          },
          {
            label: copy.stats.breaching,
            value: faNumber(stats.tickets.breaching),
            caption: fill(copy.stats.breachingCaption, { urgent: faNumber(stats.tickets.urgent) }),
            icon: TriangleAlert,
            tone:
              stats.tickets.breaching > 0
                ? "bg-danger-soft text-danger"
                : "bg-success-soft text-success",
            href: can("tickets:read")
              ? (`${adminRoutes.tickets}?scope=breaching` as Route)
              : undefined,
          },
          {
            label: copy.stats.messages,
            value: faNumber(stats.messages.unread),
            caption: copy.stats.messagesCaption,
            icon: Mail,
            tone: "bg-warning-soft text-warning",
            href: can("messages:read")
              ? (`${adminRoutes.messages}?status=new` as Route)
              : undefined,
          },
          {
            label: copy.stats.codes,
            value: faNumber(stats.warrantyCodes.active),
            caption: fill(copy.stats.codesCaption, {
              revoked: faNumber(stats.warrantyCodes.revoked),
              recalled: faNumber(stats.warrantyCodes.recalled),
            }),
            icon: ShieldCheck,
            tone: "bg-success-soft text-success",
            href: can("warranty:read") ? adminRoutes.warranty : undefined,
            className: "max-xl:col-span-2 max-lg:col-span-2 lg:max-xl:col-span-4",
          },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          {can("tickets:read") && (
            <PanelCard
              title={copy.recentTickets}
              icon={LifeBuoy}
              action={<CardLink href={adminRoutes.tickets}>{copy.allTickets}</CardLink>}
            >
              {stats.recentTickets.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">{copy.noTickets}</p>
              ) : (
                <ul className="-mx-2 flex flex-col">
                  {stats.recentTickets.map((ticket) => (
                    <li key={ticket.id}>
                      <Link
                        href={adminRoutes.ticket(ticket.id) as Route}
                        className="group flex flex-col gap-2 rounded-field px-2 py-3 transition-colors hover:bg-sunken/70 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="flex items-center gap-2">
                            <CodeText className="text-caption font-bold text-muted">
                              {ticket.formattedTrackingCode}
                            </CodeText>
                            <span className="text-caption text-subtle">·</span>
                            <span className="text-caption text-muted">
                              {adminContent.statuses.ticketType[ticket.type]}
                            </span>
                          </span>
                          <span className="truncate text-sm font-extrabold text-ink transition-colors group-hover:text-primary">
                            {ticket.subject}
                          </span>
                          <span className="truncate text-caption text-muted">
                            {ticket.name} · {ticket.city}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                          <span className="flex items-center gap-1.5">
                            <PriorityBadge priority={ticket.priority} />
                            <TicketStatusBadge status={ticket.status} />
                          </span>
                          <SlaIndicator ticket={ticket} now={now} compact />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </PanelCard>
          )}
          {audit && (
            <PanelCard
              title={copy.recentAudit}
              icon={FileClock}
              action={<CardLink href={adminRoutes.audit}>{copy.allAudit}</CardLink>}
            >
              {audit.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">{copy.noAudit}</p>
              ) : (
                <ol className="flex flex-col">
                  {audit.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center gap-3 border-b border-line py-2.5 last:border-0"
                    >
                      <UserAvatar
                        name={log.actor?.name ?? adminContent.audit.system}
                        className="size-8 text-xs"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-label text-body">
                          <span className="font-bold text-ink">
                            {log.actor?.name ?? adminContent.audit.system}
                          </span>{" "}
                          {auditActionLabel(log.action)} · {auditEntityLabel(log.entity)}
                        </span>
                        <span className="text-caption text-muted">
                          {formatDateTime("fa", log.createdAt)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </PanelCard>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <PanelCard title={copy.quickActions}>
            <ul className="-mx-1 flex flex-col gap-1">
              {actions
                .filter((action) => action.visible)
                .map((action) => (
                  <li key={action.label}>
                    <Link
                      href={action.href}
                      className="group flex items-center gap-3 rounded-field p-2 transition-colors hover:bg-sunken"
                    >
                      <span className="icon-tile size-10 transition-colors group-hover:bg-primary group-hover:text-on-primary">
                        <action.icon className="size-4.5" aria-hidden />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-extrabold text-ink">{action.label}</span>
                        <span className="truncate text-caption text-muted">{action.hint}</span>
                      </span>
                      <ArrowLeft
                        className="size-4 text-subtle transition-transform group-hover:-translate-x-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
            </ul>
          </PanelCard>
          <PanelCard title={copy.catalog}>
            <dl className="grid grid-cols-2 gap-2">
              {catalogRows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 rounded-field bg-sunken/70 px-3 py-2.5"
                >
                  <dt className="text-caption text-muted">{row.label}</dt>
                  <dd className="font-display text-lg font-black text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
