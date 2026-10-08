import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: "default" | "narrow" | "wide";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const sizeClasses = {
  default: "max-w-6xl",
  narrow: "max-w-3xl",
  wide: "max-w-7xl",
} as const;

export function Container<T extends ElementType = "div">({
  as,
  size = "default",
  className,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        "mx-auto w-full px-6 sm:px-8 lg:px-12",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
