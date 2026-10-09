import {
  Container,
  Divider,
  Heading,
  Image,
  LinkButton,
  Script,
  Section,
  Stack,
  Text,
} from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { HeroBlockData } from "@/modules/content/ui/types";

export function HeroBlock({
  heading,
  script,
  subheading,
  image,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: HeroBlockData) {
  const media = resolveMedia(image);
  const hasCtas =
    Boolean(primaryCtaLabel && primaryCtaHref) ||
    Boolean(secondaryCtaLabel && secondaryCtaHref);

  return (
    <Section tone="ivory" spacing="lg">
      <Container size="narrow">
        <Stack align="center" gap="lg" className="text-center">
          <Heading as="h1" size="xl">
            {heading}
          </Heading>
          {script ? <Script className="text-3xl">{script}</Script> : null}
          {subheading ? (
            <Text size="lg" tone="muted" className="max-w-2xl">
              {subheading}
            </Text>
          ) : null}
          <Divider lotus className="w-40" />
          {hasCtas ? (
            <Stack
              direction="row"
              gap="md"
              className="flex-wrap justify-center"
            >
              {primaryCtaLabel && primaryCtaHref ? (
                <LinkButton href={primaryCtaHref} variant="primary" size="lg">
                  {primaryCtaLabel}
                </LinkButton>
              ) : null}
              {secondaryCtaLabel && secondaryCtaHref ? (
                <LinkButton
                  href={secondaryCtaHref}
                  variant="secondary"
                  size="lg"
                >
                  {secondaryCtaLabel}
                </LinkButton>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Container>
      {media?.url ? (
        <Container size="wide" className="mt-12">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md">
            <Image
              src={media.url}
              alt={media.alt}
              fill
              className="object-cover"
              sizes="100vw"
              preload
            />
          </div>
        </Container>
      ) : null}
    </Section>
  );
}
