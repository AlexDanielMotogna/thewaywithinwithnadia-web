import { cn } from "@/lib/cn";
import { Container, Divider, Image, Text } from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { QuoteBlockData } from "@/modules/content/ui/types";

export function QuoteBlock({
  text,
  attribution,
  backgroundImage,
}: QuoteBlockData) {
  const media = resolveMedia(backgroundImage);

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        media?.url ? "bg-transparent" : "bg-sand",
      )}
    >
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          className="rounded-none object-cover"
          sizes="100vw"
        />
      ) : null}
      <Container size="narrow" className="relative py-14 text-center sm:py-20">
        {media?.url ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_75%_at_center,_var(--color-ivory)_0%,_var(--color-ivory)_30%,_transparent_75%)] opacity-90 blur-xl"
          />
        ) : null}
        <Divider lotus className="mx-auto mb-8 w-24" />
        <Text
          as="blockquote"
          size="xl"
          tone="olive"
          className="font-serif italic"
        >
          &ldquo;{text}&rdquo;
        </Text>
        {attribution ? (
          <Text size="sm" tone="muted" className="mt-6">
            — {attribution}
          </Text>
        ) : null}
      </Container>
    </section>
  );
}
