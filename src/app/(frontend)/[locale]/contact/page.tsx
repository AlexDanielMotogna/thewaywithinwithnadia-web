import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { ContactForm } from "@/modules/contact";
import { getSiteSettings, localizeHref } from "@/modules/content";
import { Container, Heading, Icon, LinkButton, Section, Text } from "@/ui";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale });

  return buildMetadata({
    pathname: "/contact",
    locale,
    title: t("ContactPage.title"),
    description: t("ContactPage.intro"),
  });
}

export default async function Contact({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getTranslations(),
  ]);

  return (
    <main className="flex-1">
      <Section>
        <Container size="narrow" className="flex flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <Heading as="h1" size="lg">
              {t("ContactPage.title")}
            </Heading>
            <Text tone="muted">{t("ContactPage.intro")}</Text>
          </div>

          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="text-olive hover:text-olive-light flex items-center gap-2"
              >
                <Icon name="mail" size={18} />
                {settings.email}
              </a>
            ) : null}
            {settings.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="text-olive hover:text-olive-light flex items-center gap-2"
              >
                {settings.phone}
              </a>
            ) : null}
          </div>

          <div className="flex justify-center">
            <LinkButton
              href={localizeHref("/book", locale)}
              variant="secondary"
            >
              {t("ContactPage.bookCta")}
            </LinkButton>
          </div>

          <ContactForm />
        </Container>
      </Section>
    </main>
  );
}
