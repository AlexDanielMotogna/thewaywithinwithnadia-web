import { Container, Heading, LinkButton, Section, Text } from "@/ui";
import type { CtaBlockData } from "@/modules/content/ui/types";

export function CtaBlock({ heading, body, ctaLabel, ctaHref }: CtaBlockData) {
  return (
    <Section tone="olive">
      <Container size="narrow" className="text-center">
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
