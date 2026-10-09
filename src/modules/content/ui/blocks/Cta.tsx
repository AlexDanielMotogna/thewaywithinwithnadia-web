import { cn } from "@/lib/cn";
import { Container, Heading, Image, LinkButton, Text } from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { CtaBlockData } from "@/modules/content/ui/types";

export function CtaBlock({
  heading,
  body,
  ctaLabel,
  ctaHref,
  backgroundImage,
  imagePosition,
}: CtaBlockData) {
  const media = resolveMedia(backgroundImage);
  const imageOnLeft = imagePosition === "left";

  return (
    <section className="bg-olive relative overflow-hidden">
      {media?.url ? (
        <div
          className={cn(
            "absolute inset-y-0 hidden sm:block",
            imageOnLeft ? "left-0" : "right-0",
          )}
          style={{
            ...(media.width && media.height
              ? {
                  aspectRatio: `${String(media.width)} / ${String(media.height)}`,
                }
              : undefined),
            // A real diagonal mask on the photo itself — not a flat
            // rectangular box with a color overlay — so there's no hard
            // edge where the box meets the solid olive background; the
            // photo's own pixels fade out along the 45° line.
            maskImage: imageOnLeft
              ? "linear-gradient(45deg, black 0%, black 65%, transparent 100%)"
              : "linear-gradient(315deg, black 0%, black 65%, transparent 100%)",
            WebkitMaskImage: imageOnLeft
              ? "linear-gradient(45deg, black 0%, black 65%, transparent 100%)"
              : "linear-gradient(315deg, black 0%, black 65%, transparent 100%)",
          }}
        >
          {/* The container matches the photo's own aspect ratio (not a
              fixed fraction of the section), so object-cover shows the
              whole photo uncropped instead of slicing off either side. */}
          <Image
            src={media.url}
            alt={media.alt}
            fill
            className="rounded-none object-cover"
            sizes="50vw"
          />
        </div>
      ) : null}
      {/* Always centered on the full section width, independent of where
          the image accent sits. */}
      <Container
        size="narrow"
        className="relative z-10 flex flex-col items-center py-16 text-center sm:py-20"
      >
        <Heading as="h2" size="lg" className="text-ivory">
          {heading}
        </Heading>
        {body ? (
          <Text size="lg" tone="inverted" className="mt-4 max-w-xl">
            {body}
          </Text>
        ) : null}
        <LinkButton
          href={ctaHref}
          variant="primary"
          size="lg"
          className="bg-ivory text-olive hover:bg-sand mt-8"
        >
          {ctaLabel}
        </LinkButton>
      </Container>
    </section>
  );
}
