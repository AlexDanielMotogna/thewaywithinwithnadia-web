import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { getPageBySlug, RenderBlocks } from "@/modules/content";
import { Container, Divider, Heading, Script, Text } from "@/ui";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const page = await getPageBySlug("home", locale);

  return buildMetadata({
    pathname: "/",
    locale,
    title: page?.seo?.title ?? "The Way Within with Nadia",
    description: page?.seo?.description ?? "A sacred space to meet yourself.",
  });
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  const page = await getPageBySlug("home", locale);

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
      <RenderBlocks blocks={page.blocks} locale={locale} />
    </main>
  );
}
