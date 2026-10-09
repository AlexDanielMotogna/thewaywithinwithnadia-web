import { RichText } from "@payloadcms/richtext-lexical/react";
import { Container, Heading, Image, LinkButton, OrnamentSpray } from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { TextImageBlockData } from "@/modules/content/ui/types";

export function TextImageBlock({
  heading,
  richText,
  image,
  imagePosition,
  ctaLabel,
  ctaHref,
}: TextImageBlockData) {
  const media = resolveMedia(image);
  const imageOnLeft = imagePosition === "left";

  const copy = (
    <>
      {heading ? (
        <Heading as="h2" size="lg" className="mb-6">
          {heading}
        </Heading>
      ) : null}
      {richText ? <RichText data={richText} /> : null}
      {ctaLabel && ctaHref ? (
        <LinkButton href={ctaHref} variant="primary" size="lg" className="mt-8">
          {ctaLabel}
        </LinkButton>
      ) : null}
    </>
  );

  if (!media?.url) {
    return (
      <section className="bg-ivory relative overflow-hidden">
        <Container size="narrow" className="py-16">
          {copy}
        </Container>
        <OrnamentSpray side="right" className="right-0 bottom-0" />
      </section>
    );
  }

  return (
    <section className="bg-ivory">
      <div className="grid grid-cols-1 items-stretch md:grid-cols-2">
        {imageOnLeft ? (
          <div className="relative min-h-[320px] md:order-1">
            <Image
              src={media.url}
              alt={media.alt}
              fill
              className="rounded-none object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        ) : null}
        <div className="relative flex flex-col justify-center overflow-hidden px-6 py-16 sm:px-10 md:order-2 lg:px-16">
          {copy}
          <OrnamentSpray side="right" className="right-0 bottom-0" />
        </div>
        {!imageOnLeft ? (
          <div className="relative order-first min-h-[320px] md:order-3">
            <Image
              src={media.url}
              alt={media.alt}
              fill
              className="rounded-none object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
