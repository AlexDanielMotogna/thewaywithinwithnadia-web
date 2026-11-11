import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { listBookableServices } from "@/modules/booking";
import { resolveMedia } from "@/modules/content";
import { Container, Heading, Icon, Image, Section, Text } from "@/ui";

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

/** Lists the bookable services; each one has its own booking page. */
export default async function Book({ params }: PageProps<"/[locale]/book">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  const [services, t] = await Promise.all([
    listBookableServices(locale),
    getTranslations(),
  ]);

  return (
    <main className="flex-1">
      <Section>
        <Container className="flex flex-col gap-12">
          <div className="mx-auto flex max-w-2xl flex-col gap-3 text-center">
            <Text size="sm" tone="olive" className="tracking-[0.3em] uppercase">
              {t("Booking.eyebrow")}
            </Text>
            <Heading as="h1" size="lg">
              {t("BookPage.title")}
            </Heading>
            <Text tone="muted">{t("BookPage.intro")}</Text>
          </div>

          {services.length === 0 ? (
            <p className="text-charcoal/80 text-center">
              {t("Booking.noServices")} {t("Booking.noServicesContact")}{" "}
              <Link href="/contact" className="text-olive underline">
                {t("Booking.contactLinkLabel")}
              </Link>
              .
            </p>
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const media = resolveMedia(service.image);
                return (
                  <li key={service.id}>
                    <Link
                      href={{
                        pathname: "/book/[service]",
                        params: { service: service.slug },
                      }}
                      className="group focus-visible:outline-gold hover:bg-sand/40 duration-fast flex h-full flex-col overflow-hidden rounded-md bg-white/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {media?.url ? (
                        <div className="relative aspect-[4/3]">
                          {/* Decorative here: the service name follows. */}
                          <Image
                            src={media.url}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="rounded-none object-cover"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <h2 className="text-olive font-serif text-2xl">
                          {service.name}
                        </h2>
                        {service.shortDescription ? (
                          <Text size="sm" tone="muted">
                            {service.shortDescription}
                          </Text>
                        ) : null}
                        <p className="text-charcoal/70 mt-auto pt-2 text-xs">
                          {t("Booking.serviceCard.durationLabel", {
                            min: service.durationMin ?? 0,
                          })}
                          {" · "}
                          {service.mode === "online"
                            ? t("Booking.index.modeOnline")
                            : service.mode === "in_person"
                              ? t("Booking.index.modeInPerson")
                              : t("Booking.index.modeBoth")}
                        </p>
                        <span className="text-olive mt-2 inline-flex items-center gap-2 text-sm font-medium">
                          {t("Booking.index.cta")}
                          <Icon
                            name="arrowRight"
                            size={16}
                            aria-hidden="true"
                            className="duration-fast transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </Section>
    </main>
  );
}
