import { Container, Divider, Section, Text } from "@/ui";
import type { QuoteBlockData } from "@/modules/content/ui/types";

export function QuoteBlock({ text, attribution }: QuoteBlockData) {
  return (
    <Section tone="sand">
      <Container size="narrow" className="text-center">
        <Divider lotus className="mx-auto mb-8 w-24" />
        <Text
          as="blockquote"
          size="xl"
          tone="olive"
          className="font-serif italic"
        >
          &ldquo;{text}&rdquo;
        </Text>
        {attribution ? (
          <Text size="sm" tone="muted" className="mt-6">
            — {attribution}
          </Text>
        ) : null}
      </Container>
    </Section>
  );
}
