"use client";

import { LoaderCircle, Save, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { type FormEventHandler, type ReactNode, useId, useRef } from "react";
import { type FieldValues, FormProvider, type UseFormReturn } from "react-hook-form";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/cn";

import { adminContent } from "../../content";
import { ReadOnlyScope } from "./read-only";

const { common } = adminContent;

interface FormSheetProps<TValues extends FieldValues, TOutput extends FieldValues> {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  form: UseFormReturn<TValues, unknown, TOutput>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  pending: boolean;
  submitLabel?: string;
  readOnly?: boolean;
  wide?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

export function FormSheet<TValues extends FieldValues, TOutput extends FieldValues>({
  open,
  onClose,
  title,
  description,
  form,
  onSubmit,
  pending,
  submitLabel = common.save,
  readOnly,
  wide,
  footer,
  children,
}: FormSheetProps<TValues, TOutput>) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const dirty = form.formState.isDirty;

  const requestClose = () => {
    if (dirty && !pending && !window.confirm(common.leaveConfirm)) return;
    onClose();
  };

  useModal(panelRef, open, requestClose);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-60 flex justify-end">
            <m.div
              aria-hidden
              onClick={requestClose}
              className="absolute inset-0 bg-night/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className={cn(
                "relative ms-auto flex h-full w-full flex-col bg-canvas shadow-lift outline-none",
                wide ? "sm:max-w-3xl" : "sm:max-w-xl",
              )}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
            >
              <FormProvider {...form}>
                <form noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-start gap-3 border-b border-line bg-surface px-5 py-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <h2 id={titleId} className="truncate text-lg font-extrabold text-ink">
                        {title}
                      </h2>
                      {description && <p className="text-xs leading-6 text-muted">{description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={requestClose}
                      aria-label={common.close}
                      data-autofocus
                      className="icon-btn size-9"
                    >
                      <X className="size-4.5" aria-hidden />
                    </button>
                  </div>
                  <div
                    className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-5"
                    data-lenis-prevent
                  >
                    <ReadOnlyScope readOnly={Boolean(readOnly)}>{children}</ReadOnlyScope>
                  </div>
                  <div className="flex items-center gap-2 border-t border-line bg-surface px-5 pb-safe pt-3">
                    {footer}
                    <span className="flex-1" />
                    <Button variant="soft" onClick={requestClose} disabled={pending}>
                      {common.cancel}
                    </Button>
                    {!readOnly && (
                      <Button type="submit" disabled={pending}>
                        {pending ? (
                          <LoaderCircle className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Save className="size-4" aria-hidden />
                        )}
                        {pending ? common.saving : submitLabel}
                      </Button>
                    )}
                  </div>
                </form>
              </FormProvider>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
