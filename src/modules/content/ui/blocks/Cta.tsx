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
            "absolute inset-y-0 hidden w-2/5 sm:block lg:w-1/3",
            imageOnLeft ? "left-0" : "right-0",
          )}
        >
          <Image
            src={media.url}
            alt={media.alt}
            fill
            className="rounded-none object-cover"
            sizes="(min-width: 1024px) 33vw, 40vw"
          />
          {/* Most of the photo stays untouched near the outer edge; the
              fade into solid olive is concentrated in the last stretch
              facing the (always-centered) text, so it reads as a corner
              accent without hiding the photo under a flat tint. */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r",
              imageOnLeft
                ? "via-olive/20 to-olive from-transparent from-0% via-60% to-100%"
                : "from-olive via-olive/20 from-0% via-40% to-transparent to-100%",
            )}
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
