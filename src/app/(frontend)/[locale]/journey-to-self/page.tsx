import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { buildMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { getPageBySlug, RenderBlocks } from "@/modules/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/journey-to-self">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const page = await getPageBySlug("journey-to-self", locale);
  if (!page) notFound();

  return buildMetadata({
    pathname: "/journey-to-self",
    locale,
    title: page.seo?.title ?? page.title,
    description: page.seo?.description ?? undefined,
  });
}

export default async function JourneyToSelf({
  params,
}: PageProps<"/[locale]/journey-to-self">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  const page = await getPageBySlug("journey-to-self", locale);

  if (!page?.blocks || page.blocks.length === 0) {
    notFound();
  }

  return (
    <main className="flex-1">
      <RenderBlocks blocks={page.blocks} locale={locale} />
    </main>
  );
}
