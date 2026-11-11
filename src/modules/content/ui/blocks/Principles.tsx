import { cn } from "@/lib/cn";
import { isBlockIconName } from "@/lib/block-icons";
import { blockIcon, Container, IconBadge, Section } from "@/ui";
import { BlockHeader } from "@/modules/content/ui/blocks/block-header";
import type { PrinciplesBlockData } from "@/modules/content/ui/types";

/** Column count follows item count so 2, 3, 4 or 6 items all sit evenly. */
const columnsClass: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-2 lg:grid-cols-3",
};

export function PrinciplesBlock({
  eyebrow,
  heading,
  script,
  variant,
  numbered,
  items,
  closing,
  tone,
}: PrinciplesBlockData) {
  if (!items || items.length === 0) return null;
  const cards = variant === "cards";

  return (
    <Section tone={tone === "soft" ? "soft" : "ivory"} spacing="sm">
      <Container>
        <BlockHeader
          eyebrow={eyebrow}
          heading={heading}
          script={script}
          className="mb-12"
        />
        <ul
          className={cn(
            "grid grid-cols-1",
            columnsClass[Math.min(items.length, 6)] ?? "lg:grid-cols-3",
            cards ? "gap-5" : "gap-y-10",
          )}
        >
          {items.map((item, index) => {
            const icon = isBlockIconName(item.icon)
              ? blockIcon(item.icon)
              : null;
            const title = numbered
              ? `${String(index + 1)}. ${item.title}`
              : item.title;

            return cards ? (
              <li
                key={item.id ?? item.title}
                className="border-sand flex gap-5 rounded-lg border bg-white/55 p-6"
              >
                {icon ? <IconBadge name={icon} /> : null}
                <div className="flex flex-col gap-2">
                  <h3 className="text-olive-dark text-sm font-medium tracking-[0.18em] uppercase">
                    {title}
                  </h3>
                  <p className="text-charcoal/75 text-[0.95rem] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </li>
            ) : (
              <li
                key={item.id ?? item.title}
                className="border-sand-dark/70 flex flex-col items-center gap-3 px-6 text-center sm:[&:not(:first-child)]:border-l"
              >
                {icon ? (
                  <IconBadge name={icon} size="lg" variant="line" />
                ) : null}
                <h3 className="text-olive-dark font-serif text-2xl font-medium">
                  {title}
                </h3>
                <p className="text-charcoal/75 max-w-64 text-[0.95rem] leading-relaxed">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
        {closing ? (
          <p className="font-script text-terracotta mt-12 text-center text-2xl leading-snug sm:text-3xl">
            {closing}
          </p>
        ) : null}
      </Container>
    </Section>
  );
}
