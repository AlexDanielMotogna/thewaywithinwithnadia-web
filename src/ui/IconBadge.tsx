import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/ui/Icon";

type IconBadgeProps = {
  name: IconName;
  size?: "md" | "lg";
  /** "soft" = blush circle; "line" = bare icon, no circle. */
  variant?: "soft" | "line";
  className?: string;
};

const sizes = {
  md: { box: "h-14 w-14", icon: 26 },
  lg: { box: "h-20 w-20", icon: 36 },
} as const;

/** A fine-line terracotta icon, optionally on a soft blush circle. Decorative. */
export function IconBadge({
  name,
  size = "md",
  variant = "soft",
  className,
}: IconBadgeProps) {
  const { box, icon } = sizes[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "text-terracotta inline-flex shrink-0 items-center justify-center",
        box,
        variant === "soft" && "bg-blush rounded-full",
        className,
      )}
    >
      <Icon name={name} size={icon} strokeWidth={1} />
    </span>
  );
}
