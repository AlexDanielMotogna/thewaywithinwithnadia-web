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
            // A percentage-based diagonal gradient breaks down on a wide,
            // short box: the gradient line is measured corner-to-corner,
            // so almost the whole visible area lands in the "still fully
            // opaque" part and the fade only shows up in a tiny sliver
            // near one corner — it reads as a hard edge, not a diagonal
            // fade. Fix: clip-path cuts an actual 45°-ish diagonal silhouette
            // (pixel offset, independent of box size), then a plain
            // horizontal mask — fixed pixel width, not a percentage —
            // softens that already-diagonal edge uniformly.
            clipPath: imageOnLeft
              ? "polygon(0 0, calc(100% - 150px) 0, 100% 100%, 0 100%)"
              : "polygon(150px 0, 100% 0, 100% 100%, 0 100%)",
            maskImage: imageOnLeft
              ? "linear-gradient(to right, black 0, black calc(100% - 140px), transparent 100%)"
              : "linear-gradient(to left, black 0, black calc(100% - 140px), transparent 100%)",
            WebkitMaskImage: imageOnLeft
              ? "linear-gradient(to right, black 0, black calc(100% - 140px), transparent 100%)"
              : "linear-gradient(to left, black 0, black calc(100% - 140px), transparent 100%)",
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
