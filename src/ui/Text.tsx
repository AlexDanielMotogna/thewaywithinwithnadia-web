import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const textVariants = cva("font-sans", {
  variants: {
    size: {
      sm: "text-sm",
      base: "text-base leading-relaxed",
      lg: "text-lg leading-relaxed",
      xl: "text-xl leading-relaxed",
    },
    tone: {
      body: "text-charcoal",
      muted: "text-charcoal/70",
      olive: "text-olive",
      accent: "text-terracotta",
      inverted: "text-ivory",
    },
  },
  defaultVariants: {
    size: "base",
    tone: "body",
  },
});

type TextProps<T extends ElementType> = {
  as?: T;
} & VariantProps<typeof textVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as" | "color">;

export function Text<T extends ElementType = "p">({
  as,
  size,
  tone,
  className,
  ...props
}: TextProps<T>) {
  const Component = as ?? "p";
  return (
    <Component
      className={cn(textVariants({ size, tone }), className)}
      {...props}
    />
  );
}
