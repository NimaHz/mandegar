"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "@/components/ui/toast";
import { adminRoutes } from "@/lib/routes";

import { type AdminApiError, type EdenFailure, toApiError } from "./api-error";

export interface EdenResult<TData> {
  data: TData | null;
  error: EdenFailure | null;
  headers?: unknown;
}

export interface MutationOptions<TData> {
  success?: string | ((data: TData) => string);
  description?: string;
  refresh?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: AdminApiError) => void;
}

const headerOf = (headers: unknown, name: string) =>
  headers instanceof Headers ? headers.get(name) : null;

export const notifyError = (error: AdminApiError) =>
  toast({ title: error.message, tone: "danger" });

export function useAdminMutation() {
  const router = useRouter();
  const [pending, setPending] = useState(0);

  const run = async <TData>(
    request: () => Promise<EdenResult<TData>>,
    options: MutationOptions<TData> = {},
  ): Promise<TData | null> => {
    setPending((count) => count + 1);
    try {
      const result = await request().catch(() => null);
      if (!result || result.error || result.data === null) {
        const error = toApiError(result?.error ?? null, headerOf(result?.headers, "retry-after"));
        if (error.code === "UNAUTHORIZED") {
          router.replace(adminRoutes.login as Route);
          return null;
        }
        if (error.code === "PASSWORD_CHANGE_REQUIRED") router.push(adminRoutes.account);
        options.onError?.(error);
        notifyError(error);
        return null;
      }
      const data = result.data;
      const title = typeof options.success === "function" ? options.success(data) : options.success;
      if (title) toast({ title, description: options.description, tone: "success" });
      options.onSuccess?.(data);
      if (options.refresh !== false) router.refresh();
      return data;
    } finally {
      setPending((count) => count - 1);
    }
  };

  return { run, pending: pending > 0 };
}
