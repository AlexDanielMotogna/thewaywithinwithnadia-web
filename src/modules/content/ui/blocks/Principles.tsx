import { Container, Heading, Section, Stack, Text } from "@/ui";
import type { PrinciplesBlockData } from "@/modules/content/ui/types";

export function PrinciplesBlock({ heading, items }: PrinciplesBlockData) {
  if (!items || items.length === 0) return null;

  return (
    <Section tone="sand">
      <Container>
        {heading ? (
          <Heading as="h2" size="lg" className="mb-10 text-center">
            {heading}
          </Heading>
        ) : null}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Stack
              key={item.id ?? item.title}
              gap="sm"
              className="text-center sm:text-left"
            >
              <Heading as="h3" size="sm">
                {item.title}
              </Heading>
              <Text tone="muted">{item.description}</Text>
            </Stack>
          ))}
        </div>
      </Container>
    </Section>
  );
}
