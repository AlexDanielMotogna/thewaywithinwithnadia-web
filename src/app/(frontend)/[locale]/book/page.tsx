import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { BookingFlow, listBookableServices } from "@/modules/booking";
import { Container, Heading, Section, Text } from "@/ui";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/book">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale });

  return buildMetadata({
    pathname: "/book",
    locale,
    title: t("BookPage.title"),
    description: t("BookPage.intro"),
  });
}

export default async function Book({ params }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  const [services, t] = await Promise.all([
    listBookableServices(),
    getTranslations(),
  ]);

  return (
    <main className="flex-1">
      <Section>
        <Container size="narrow" className="flex flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <Heading as="h1" size="lg">
              {t("BookPage.title")}
            </Heading>
            <Text tone="muted">{t("BookPage.intro")}</Text>
          </div>

          <BookingFlow services={services} locale={locale} />
        </Container>
      </Section>
    </main>
  );
}
