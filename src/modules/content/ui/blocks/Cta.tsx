import type { TypedLocale } from "payload";
import { cn } from "@/lib/cn";
import { Container, Heading, Image, LinkButton, Text } from "@/ui";
import { localizeHref } from "@/modules/content/ui/localize-href";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { CtaBlockData } from "@/modules/content/ui/types";

export function CtaBlock({
  heading,
  body,
  ctaLabel,
  ctaHref,
  backgroundImage,
  imagePosition,
  locale,
}: CtaBlockData & { locale: TypedLocale }) {
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
          style={
            media.width && media.height
              ? {
                  aspectRatio: `${String(media.width)} / ${String(media.height)}`,
                }
              : undefined
          }
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
          {/* This photo already fades to a soft, blurred green on its own
              far side — the overlay only needs to finish that fade into
              solid olive right at the edge touching the text, not tint
              the whole photo. */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r",
              imageOnLeft
                ? "to-olive from-transparent from-0% via-transparent via-80% to-100%"
                : "from-olive from-0% via-transparent via-20% to-transparent to-100%",
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
          href={localizeHref(ctaHref, locale)}
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
