import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

/** Small letter-spaced overline above a heading ("A GENTLE WELCOME"). */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-terracotta font-sans text-xs font-medium tracking-[0.3em] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
