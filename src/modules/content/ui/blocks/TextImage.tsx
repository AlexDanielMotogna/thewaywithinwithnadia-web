import { RichText } from "@payloadcms/richtext-lexical/react";
import { cn } from "@/lib/cn";
import { Container, Heading, Image, Section } from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { TextImageBlockData } from "@/modules/content/ui/types";

export function TextImageBlock({
  heading,
  richText,
  image,
  imagePosition,
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
    </>
  );

  if (!media?.url) {
    return (
      <Section tone="ivory">
        <Container size="narrow">{copy}</Container>
      </Section>
    );
  }

  return (
    <Section tone="ivory">
      <Container size="wide">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-md",
              imageOnLeft ? "md:order-1" : "md:order-2",
            )}
          >
            <Image
              src={media.url}
              alt={media.alt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className={imageOnLeft ? "md:order-2" : "md:order-1"}>
            {copy}
          </div>
        </div>
      </Container>
    </Section>
  );
}
