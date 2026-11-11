import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { env } from "@/lib/env";
import {
  BookingExtras,
  BookingHero,
  getBookableServiceBySlug,
  getBookingPage,
  listBookableServices,
  ServiceBooking,
} from "@/modules/booking";
import { Container } from "@/ui";

type Props = PageProps<"/[locale]/book/[service]">;

// Everything on the page depends on the service slug, so there is no
// static shell to show first: every bookable service is prerendered via
// generateStaticParams, and navigating to one simply waits for it.
export const instant = false;

export async function generateStaticParams() {
  const services = await listBookableServices(routing.defaultLocale);
  return routing.locales.flatMap((locale) =>
    services.map((service) => ({ locale, service: service.slug })),
  );
}

function serviceUrl(slug: string, locale: (typeof routing.locales)[number]) {
  return new URL(
    getPathname({
      href: { pathname: "/book/[service]", params: { service: slug } },
      locale,
    }),
    env.NEXT_PUBLIC_SITE_URL,
  ).toString();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, service: slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const service = await getBookableServiceBySlug(slug, locale);
  if (!service) notFound();
  const t = await getTranslations({ locale });

  const title = `${service.name} · ${t("BookPage.title")}`;
  const description = service.shortDescription ?? t("BookPage.intro");
  const languages: Record<string, string> = {
    "x-default": serviceUrl(slug, routing.defaultLocale),
  };
  for (const loc of routing.locales) languages[loc] = serviceUrl(slug, loc);

  return {
    title,
    description,
    alternates: { canonical: serviceUrl(slug, locale), languages },
    openGraph: {
      title,
      description,
      url: serviceUrl(slug, locale),
      siteName: "The Way Within with Nadia",
      locale,
      type: "website",
    },
  };
}

export default async function ServiceBookingPage({ params }: Props) {
  const { locale, service: slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  const [service, content, t] = await Promise.all([
    getBookableServiceBySlug(slug, locale),
    getBookingPage(locale),
    getTranslations(),
  ]);
  if (!service) notFound();

  return (
    <main className="flex-1">
      <BookingHero service={service} eyebrow={t("Booking.eyebrow")} />
      <Container className="py-12 lg:py-16">
        <ServiceBooking service={service} locale={locale} />
      </Container>
      <BookingExtras
        content={content}
        whatToExpectTitle={t("Booking.whatToExpect")}
      />
    </main>
  );
}
