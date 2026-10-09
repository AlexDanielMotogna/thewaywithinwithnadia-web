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
            "flex flex-col justify-center px-6 py-16 text-center sm:px-10 sm:py-20 md:col-span-3 md:text-left",
            imageOnLeft ? "md:order-2" : "md:order-1",
          )}
        >
          <Heading as="h2" size="lg" className="text-ivory">
            {heading}
          </Heading>
          {body ? (
            <Text
              size="lg"
              tone="inverted"
              className="mx-auto mt-4 max-w-xl md:mx-0"
            >
              {body}
            </Text>
          ) : null}
          <LinkButton
            href={ctaHref}
            variant="primary"
            size="lg"
            className="bg-ivory text-olive hover:bg-sand mx-auto mt-8 md:mx-0"
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
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-r",
                imageOnLeft
                  ? "to-olive from-transparent"
                  : "from-olive to-transparent",
              )}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
