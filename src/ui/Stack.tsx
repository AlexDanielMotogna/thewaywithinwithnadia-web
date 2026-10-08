import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const stackVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
    },
    gap: {
      xs: "gap-2",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-10",
      xl: "gap-16",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
  },
  defaultVariants: {
    direction: "column",
    gap: "md",
  },
});

type StackProps = ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof stackVariants>;

export function Stack({
  direction,
  gap,
  align,
  justify,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        stackVariants({ direction, gap, align, justify }),
        className,
      )}
      {...props}
    />
  );
}
