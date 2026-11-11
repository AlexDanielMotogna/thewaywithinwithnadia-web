import { cn } from "@/lib/cn";

const MAX_LENGTH = 48;

type ScriptProps = {
  children: string;
  className?: string;
};

/**
 * The script accent font — "with Nadia", short emotional phrases, selected
 * quotes. Never for body copy or functional UI (Master Doc §3). `children`
 * is typed as a plain string (no rich content) and capped at ~48 chars to
 * make misuse hard; longer input is a sign this is the wrong primitive.
 */
export function Script({ children, className }: ScriptProps) {
  if (process.env.NODE_ENV !== "production" && children.length > MAX_LENGTH) {
    console.warn(
      `<Script> is for short accent phrases only (got ${String(children.length)} chars). Use <Text> or <Heading> instead.`,
    );
  }

  return (
    <span className={cn("font-script text-terracotta", className)}>
      {children}
    </span>
  );
}
