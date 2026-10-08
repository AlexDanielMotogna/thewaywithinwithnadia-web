import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FormFieldRenderProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean;
};

type FormFieldProps = {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: (field: FormFieldRenderProps) => ReactNode;
};

/**
 * One form-field shape for Contact, Enquiry and Booking (ENGINEERING.md §7.2).
 * Renders the input via a render prop so every control gets the same id /
 * aria-describedby / aria-invalid wiring without relying on cloneElement.
 */
export function FormField({
  label,
  error,
  description,
  required,
  className,
  children,
}: FormFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-olive font-sans text-sm">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error),
      })}
      {description ? (
        <p id={descriptionId} className="text-charcoal/60 text-xs">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
