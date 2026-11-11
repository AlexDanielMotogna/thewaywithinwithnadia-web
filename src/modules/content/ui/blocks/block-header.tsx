import { cn } from "@/lib/cn";
import { Divider, Eyebrow, Heading } from "@/ui";

type BlockHeaderProps = {
  eyebrow?: string | null | undefined;
  heading?: string | null | undefined;
  script?: string | null | undefined;
  align?: "center" | "start";
  /** Heading level — h1 only for a page's hero. */
  as?: "h1" | "h2";
  size?: "md" | "lg" | "xl";
  headingStyle?: "serif" | "script";
  className?: string;
};

/**
 * Eyebrow → heading → handwritten line → short rule. The one heading
 * pattern every block shares, so sections stay visually consistent.
 */
export function BlockHeader({
  eyebrow,
  heading,
  script,
  align = "center",
  as = "h2",
  size = "lg",
  headingStyle = "serif",
  className,
}: BlockHeaderProps) {
  if (!eyebrow && !heading && !script) return null;
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {heading ? (
        <Heading
          as={as}
          size={size}
          className={cn(
            headingStyle === "script" &&
              "font-script text-5xl font-normal sm:text-6xl",
          )}
        >
          {heading}
        </Heading>
      ) : null}
      {script ? (
        <p className="font-script text-terracotta text-2xl leading-snug sm:text-3xl">
          {script}
        </p>
      ) : null}
      {centered ? (
        <Divider lotus tone="terracotta" className="mt-1 w-28" />
      ) : (
        <span
          aria-hidden="true"
          className="bg-terracotta-light/60 mt-1 h-px w-14"
        />
      )}
    </div>
  );
}
