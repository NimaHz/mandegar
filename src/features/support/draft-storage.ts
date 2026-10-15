import { isRecord } from "@/lib/guards";
import type { TicketReceipt } from "@/types/support";

import { type RequestStep, requestSteps } from "./constants";
import { emptyRequest, isRequestField, type RequestValues } from "./schemas";

const DRAFT_KEY = "mandegar:service-request:draft";
const RECEIPT_KEY = "mandegar:service-request:receipt";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface RequestDraft {
  values: RequestValues;
  step: RequestStep;
  furthest: number;
}

const read = (key: string): unknown => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown) => {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const sanitizeValues = (input: unknown): RequestValues => {
  const values = { ...emptyRequest };
  if (!isRecord(input)) return values;
  for (const [key, value] of Object.entries(input)) {
    if (isRequestField(key) && typeof value === "string") Object.assign(values, { [key]: value });
  }
  if (!ISO_DATE.test(values.purchaseDate)) values.purchaseDate = "";
  return values;
};

export const readDraft = (): RequestDraft | null => {
  const stored = read(DRAFT_KEY);
  if (!isRecord(stored)) return null;
  const step = requestSteps.find((entry) => entry === stored.step) ?? "type";
  const furthest = typeof stored.furthest === "number" ? stored.furthest : 0;
  return {
    values: sanitizeValues(stored.values),
    step,
    furthest: Math.min(Math.max(furthest, requestSteps.indexOf(step)), requestSteps.length - 1),
  };
};

export const writeDraft = (draft: RequestDraft | null) => write(DRAFT_KEY, draft);

export const readReceipt = (): TicketReceipt | null => {
  const stored = read(RECEIPT_KEY);
  return isRecord(stored) &&
    typeof stored.trackingCode === "string" &&
    typeof stored.accessToken === "string" &&
    typeof stored.urgent === "boolean"
    ? { trackingCode: stored.trackingCode, accessToken: stored.accessToken, urgent: stored.urgent }
    : null;
};

export const writeReceipt = (receipt: TicketReceipt | null) => write(RECEIPT_KEY, receipt);
