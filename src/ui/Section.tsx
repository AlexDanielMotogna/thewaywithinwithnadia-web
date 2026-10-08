import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const sectionVariants = cva("", {
  variants: {
    tone: {
      ivory: "bg-ivory",
      sand: "bg-sand",
      olive: "bg-olive text-ivory",
    },
    spacing: {
      sm: "py-section-sm",
      default: "py-section",
      lg: "py-section-lg",
    },
  },
  defaultVariants: {
    tone: "ivory",
    spacing: "default",
  },
});

type SectionProps = ComponentPropsWithoutRef<"section"> &
  VariantProps<typeof sectionVariants>;

export function Section({ tone, spacing, className, ...props }: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ tone, spacing }), className)}
      {...props}
    />
  );
}
