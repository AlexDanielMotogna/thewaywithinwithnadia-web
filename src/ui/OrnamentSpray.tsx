import NextImage from "next/image";
import { cn } from "@/lib/cn";

type OrnamentSprayProps = {
  /** Which half of the source spray to crop in — matches the corner it sits in. */
  side?: "left" | "right";
  className?: string;
};

/** Decorative olive-branch corner accent (Master Doc §2/§3). Purely ornamental. */
export function OrnamentSpray({
  side = "left",
  className,
}: OrnamentSprayProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-20 w-36 opacity-80 select-none sm:h-28 sm:w-52",
        className,
      )}
    >
      <NextImage
        src="/ornament-olive.png"
        alt=""
        fill
        className={cn(
          "object-cover",
          side === "left" ? "object-left" : "object-right",
        )}
        sizes="208px"
      />
    </div>
  );
}
