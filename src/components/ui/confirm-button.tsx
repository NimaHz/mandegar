"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { useDictionary } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";

interface ConfirmButtonProps {
  onConfirm: () => void;
  label: string;
  confirmLabel?: string;
  children: ReactNode;
  className?: string;
  armedClassName?: string;
  disabled?: boolean;
}

export function ConfirmButton({
  onConfirm,
  label,
  confirmLabel,
  children,
  className,
  armedClassName,
  disabled,
}: ConfirmButtonProps) {
  const { ui } = useDictionary();
  const prompt = confirmLabel ?? ui.confirm;
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = () => {
    window.clearTimeout(timer.current);
    if (armed) {
      setArmed(false);
      onConfirm();
      return;
    }
    setArmed(true);
    timer.current = window.setTimeout(() => setArmed(false), 3000);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onBlur={() => setArmed(false)}
      aria-label={armed ? `${prompt} ${label}` : label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 font-bold whitespace-nowrap transition-colors duration-200",
        "text-muted hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-30",
        className,
        armed && [
          "bg-danger text-on-primary hover:bg-danger hover:text-on-primary",
          armedClassName,
        ],
      )}
    >
      {armed ? <span className="px-1 text-xs">{prompt}</span> : children}
    </button>
  );
}
