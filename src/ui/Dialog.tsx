"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * Native <dialog> — browser handles focus trapping, Esc-to-close and the
 * backdrop for free, so we don't hand-roll modal accessibility.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="dialog-title"
      className={cn(
        "border-gold/30 bg-ivory text-charcoal backdrop:bg-charcoal/40 m-auto rounded-lg border p-8 shadow-xl",
        className,
      )}
    >
      <h2 id="dialog-title" className="text-olive font-serif text-xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </dialog>
  );
}
