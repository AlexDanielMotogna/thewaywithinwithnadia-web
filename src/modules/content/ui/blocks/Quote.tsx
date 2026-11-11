import { cn } from "@/lib/cn";
import { Container, Divider, Image, Text } from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { QuoteBlockData } from "@/modules/content/ui/types";

export function QuoteBlock({
  text,
  attribution,
  style,
  backgroundImage,
}: QuoteBlockData) {
  const media = resolveMedia(backgroundImage);
  const script = style === "script";

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        media?.url ? "bg-transparent" : "bg-ivory-dark",
      )}
    >
      {media?.url ? (
        <>
          <Image
            src={media.url}
            alt={media.alt}
            fill
            className="-z-20 rounded-none object-cover"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="bg-ivory/75 absolute inset-0 -z-10"
          />
        </>
      ) : null}
      <Container size="narrow" className="py-14 text-center sm:py-20">
        <Divider lotus tone="terracotta" className="mx-auto mb-8 w-24" />
        <blockquote>
          <p
            className={cn(
              script
                ? "font-script text-terracotta text-3xl leading-snug sm:text-4xl"
                : "text-olive-dark font-serif text-2xl leading-snug italic sm:text-3xl",
            )}
          >
            {script ? text : <>&ldquo;{text}&rdquo;</>}
          </p>
        </blockquote>
        {attribution ? (
          <Text
            size="sm"
            tone="muted"
            className="mt-6 tracking-[0.2em] uppercase"
          >
            {attribution}
          </Text>
        ) : null}
      </Container>
    </section>
  );
}
