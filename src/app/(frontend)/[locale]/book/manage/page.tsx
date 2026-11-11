import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getManagedBooking, ManageBooking } from "@/modules/booking";
import { Container, Heading, Section, Text } from "@/ui";

// A private page reached only through the signed link in a booking email:
// never indexed, never in the sitemap.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]/book/manage">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale });
  return {
    title: t("ManageBooking.title"),
    robots: { index: false, follow: false },
  };
}

async function ManageContent({
  locale,
  searchParams,
}: {
  locale: "en" | "de";
  searchParams: PageProps<"/[locale]/book/manage">["searchParams"];
}) {
  // Per-request: the link's validity depends on the current time.
  await connection();
  const { token } = await searchParams;
  const t = await getTranslations({ locale });
  const result =
    typeof token === "string"
      ? { token, booking: await getManagedBooking(token) }
      : null;

  if (result?.booking.ok) {
    return (
      <ManageBooking
        token={result.token}
        booking={result.booking.value}
        locale={locale}
      />
    );
  }

  const error = result && !result.booking.ok ? result.booking.error : null;
  const message =
    error?.kind === "not_active"
      ? t("ManageBooking.notActive")
      : error?.kind === "too_late"
        ? t("ManageBooking.tooLate", { hours: error.hours })
        : t("ManageBooking.invalidLink");
  return (
    <p role="alert" className="text-charcoal/80">
      {message} {t("ManageBooking.contactHint")}{" "}
      <Link href="/contact" className="text-olive underline">
        {t("ManageBooking.contactLinkLabel")}
      </Link>
      .
    </p>
  );
}

export default async function ManageBookingPage({
  params,
  searchParams,
}: PageProps<"/[locale]/book/manage">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="flex-1">
      <Section>
        <Container size="narrow" className="flex flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <Heading as="h1" size="lg">
              {t("ManageBooking.title")}
            </Heading>
            <Text tone="muted">{t("ManageBooking.intro")}</Text>
          </div>
          <Suspense fallback={null}>
            <ManageContent locale={locale} searchParams={searchParams} />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
}
