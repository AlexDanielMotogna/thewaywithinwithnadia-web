import { cn } from "@/lib/cn";
import { Container, Heading, Image, LinkButton, Section, Text } from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { CtaBlockData } from "@/modules/content/ui/types";

export function CtaBlock({
  heading,
  body,
  ctaLabel,
  ctaHref,
  backgroundImage,
}: CtaBlockData) {
  const media = resolveMedia(backgroundImage);

  return (
    <Section
      tone={media?.url ? undefined : "olive"}
      className={cn("relative overflow-hidden", media?.url && "bg-transparent")}
    >
      {media?.url ? (
        <>
          <Image
            src={media.url}
            alt={media.alt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="bg-olive/70 absolute inset-0" />
        </>
      ) : null}
      <Container size="narrow" className="relative text-center">
        <Heading as="h2" size="lg" className="text-ivory">
          {heading}
        </Heading>
        {body ? (
          <Text size="lg" tone="inverted" className="mx-auto mt-4 max-w-xl">
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
    </Section>
  );
}
