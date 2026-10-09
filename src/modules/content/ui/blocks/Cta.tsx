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
            // A literal `45deg` gradient breaks down on a wide, short box:
            // the gradient *line* always runs corner-to-corner regardless
            // of angle, so a fixed 45deg line is far longer than the box
            // is tall, and percentage stops land almost entirely in the
            // "still fully opaque" part — it reads as a hard edge. The
            // `to <corner>` keyword form instead defines the line to run
            // through that exact corner, which CSS computes *from the
            // box's own aspect ratio* — so percentage stops scale
            // correctly and the fade is actually visible, for any box
            // shape, without hardcoded pixel offsets.
            maskImage: imageOnLeft
              ? "linear-gradient(to top right, black 0%, black 45%, transparent 100%)"
              : "linear-gradient(to top left, black 0%, black 45%, transparent 100%)",
            WebkitMaskImage: imageOnLeft
              ? "linear-gradient(to top right, black 0%, black 45%, transparent 100%)"
              : "linear-gradient(to top left, black 0%, black 45%, transparent 100%)",
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
