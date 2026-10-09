import { getPageBySlug, RenderBlocks } from "@/modules/content";
import { Container, Divider, Heading, Script, Text } from "@/ui";

export default async function Home() {
  const page = await getPageBySlug("home");

  if (!page?.blocks || page.blocks.length === 0) {
    return (
      <main className="py-section flex flex-1 flex-col items-center justify-center">
        <Container
          size="narrow"
          className="flex flex-col items-center gap-6 text-center"
        >
          <Heading as="h1" size="xl">
            THE WAY WITHIN
          </Heading>
          <Script className="text-3xl">with Nadia</Script>
          <Divider lotus className="w-40" />
          <Text size="lg" tone="muted">
            Site under construction — see CHECKLIST.md for build progress.
          </Text>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <RenderBlocks blocks={page.blocks} />
    </main>
  );
}
