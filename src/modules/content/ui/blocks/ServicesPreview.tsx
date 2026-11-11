import NextLink from "next/link";
import type { TypedLocale } from "payload";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import type { Service } from "@/payload-types";
import { Container, Icon, Image, Section } from "@/ui";
import { getFeaturedServices } from "@/modules/content/infrastructure/get-featured-services";
import { BlockHeader } from "@/modules/content/ui/blocks/block-header";
import { localizeHref } from "@/modules/content/ui/localize-href";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { ServicesPreviewBlockData } from "@/modules/content/ui/types";

function isPopulatedService(value: number | Service): value is Service {
  return typeof value === "object";
}

const columnsClass: Record<number, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

export async function ServicesPreviewBlock({
  eyebrow,
  heading,
  script,
  services,
  locale,
}: ServicesPreviewBlockData & { locale: TypedLocale }) {
  const populated = services?.filter(isPopulatedService) ?? [];
  const list =
    populated.length > 0 ? populated : await getFeaturedServices(locale);

  if (list.length === 0) return null;
  const t = await getTranslations();

  return (
    <Section tone="ivory" spacing="sm" className="relative overflow-hidden">
      <Container size="wide">
        <BlockHeader
          eyebrow={eyebrow}
          heading={heading}
          script={script}
          className="mb-12"
        />
        <ul
          className={cn(
            "grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2",
            columnsClass[list.length] ?? "lg:grid-cols-4",
          )}
        >
          {list.map((service) => {
            const media = resolveMedia(service.image);
            return (
              <li
                key={service.id}
                className="flex flex-col items-center text-center"
              >
                {media?.url ? (
                  <div className="relative mb-5 aspect-[5/4] w-full max-w-xs overflow-hidden rounded-t-full">
                    <Image
                      src={media.url}
                      alt={media.alt}
                      fill
                      className="rounded-none object-cover"
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : null}
                <h3 className="text-olive-dark font-serif text-2xl font-medium">
                  {service.name}
                </h3>
                {service.shortDescription ? (
                  <p className="text-charcoal/75 mt-2 max-w-60 text-[0.95rem] leading-relaxed">
                    {service.shortDescription}
                  </p>
                ) : null}
                {service.bookingEnabled ? (
                  <NextLink
                    href={localizeHref(`/book/${service.slug}`, locale)}
                    className="text-terracotta hover:text-olive-dark mt-3 inline-flex min-h-6 items-center gap-1.5 text-sm"
                  >
                    {t("ServicesPreview.book")}
                    <span className="sr-only">: {service.name}</span>
                    <Icon name="arrowRight" size={14} />
                  </NextLink>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
