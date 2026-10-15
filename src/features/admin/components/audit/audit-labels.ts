import type { AdminAuditLog } from "@/types/admin";

import { adminContent } from "../../content";

const copy = adminContent.audit;

export const auditEntityLabel = (entity: string) => copy.entities[entity] ?? entity;

export const auditActionLabel = (action: string) => copy.actions[action] ?? action;

export const auditSummary = (log: AdminAuditLog) =>
  `${auditActionLabel(log.action)} · ${auditEntityLabel(log.entity)}`;
