import { cn } from "@/lib/cn";
import { Heading, Image, LinkButton, Text } from "@/ui";
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
    <section className="bg-olive">
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div
          className={cn(
            "flex flex-col items-center justify-center px-6 py-16 text-center sm:px-10 sm:py-20 md:col-span-3",
            imageOnLeft ? "md:order-2" : "md:order-1",
          )}
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
        </div>
        {media?.url ? (
          <div
            className={cn(
              "relative min-h-[220px] md:col-span-2",
              imageOnLeft ? "md:order-1" : "md:order-2",
            )}
          >
            <Image
              src={media.url}
              alt={media.alt}
              fill
              className="rounded-none object-cover"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
            {/* Tint the whole photo toward olive first, so it reads as part
                of the same color world, then fade it fully into the solid
                band at the edge touching the text — one surface, not a
                photo box with a hard seam. */}
            <div className="bg-olive/35 absolute inset-0 mix-blend-multiply" />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-r",
                imageOnLeft
                  ? "via-olive/55 to-olive from-transparent"
                  : "from-olive via-olive/55 to-transparent",
              )}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
