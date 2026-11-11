import { cn } from "@/lib/cn";

/** The fine-line sun mark of the logo (Master Doc §27). Decorative. */
export function SunMark({ className }: { className?: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("text-terracotta", className)}
    >
      <circle cx="24" cy="24" r="8" />
      <circle cx="24" cy="24" r="4.5" />
      {rays.map((deg, i) => (
        <line
          key={deg}
          x1="24"
          y1={i % 2 === 0 ? 4 : 8}
          x2="24"
          y2="13"
          transform={`rotate(${String(deg)} 24 24)`}
        />
      ))}
    </svg>
  );
}

type LogoProps = {
  className?: string;
  /** Hide the sun mark, e.g. where space is tight. */
  showMark?: boolean;
};

/**
 * Wordmark: sun + "The Way Within" + "with Nadia". Text only — the parent
 * decides whether it is a link (and gives it an accessible name).
 */
export function Logo({ className, showMark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {showMark ? <SunMark className="h-10 w-10 sm:h-11 sm:w-11" /> : null}
      <span className="flex flex-col leading-none">
        <span className="text-olive-dark font-serif text-2xl font-medium tracking-wide sm:text-[1.7rem]">
          The Way Within
        </span>
        <span className="font-script text-terracotta -mt-0.5 pl-1 text-xl sm:text-2xl">
          with Nadia
        </span>
      </span>
    </span>
  );
}
