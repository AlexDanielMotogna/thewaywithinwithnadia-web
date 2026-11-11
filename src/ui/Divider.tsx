import { cn } from "@/lib/cn";
import { Icon } from "@/ui/Icon";

type DividerProps = {
  tone?: "gold" | "olive" | "terracotta";
  lotus?: boolean;
  className?: string;
};

/** Thin hairline divider, optionally centred on a small lotus motif (Master Doc §3/§26). */
export function Divider({
  tone = "gold",
  lotus = false,
  className,
}: DividerProps) {
  const lineColor = {
    gold: "bg-gold/60",
    olive: "bg-olive/40",
    terracotta: "bg-terracotta-light/50",
  }[tone];
  const iconColor = {
    gold: "text-gold",
    olive: "text-olive",
    terracotta: "text-terracotta-light",
  }[tone];

  if (!lotus) {
    return <hr className={cn("h-px border-0", lineColor, className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)} role="separator">
      <span className={cn("h-px flex-1", lineColor)} />
      <Icon name="lotus" className={iconColor} size={16} />
      <span className={cn("h-px flex-1", lineColor)} />
    </div>
  );
}
