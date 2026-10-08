import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const headingVariants = cva("font-serif text-olive", {
  variants: {
    size: {
      sm: "text-2xl sm:text-3xl",
      md: "text-3xl sm:text-4xl",
      lg: "text-4xl sm:text-5xl",
      xl: "text-5xl sm:text-6xl lg:text-7xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
    },
  },
  defaultVariants: {
    size: "md",
    weight: "normal",
  },
});

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = ComponentPropsWithoutRef<HeadingLevel> &
  VariantProps<typeof headingVariants> & {
    as: HeadingLevel;
  };

export function Heading({
  as,
  size,
  weight,
  className,
  ...props
}: HeadingProps) {
  const Component = as;
  return (
    <Component
      className={cn(headingVariants({ size, weight }), className)}
      {...props}
    />
  );
}
