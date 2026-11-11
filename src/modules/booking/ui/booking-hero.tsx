import { resolveMedia } from "@/modules/content";
import type { Service } from "@/payload-types";
import { Container, Heading, Image, Script, Text } from "@/ui";

/**
 * Service booking page header: copy on warm ivory to the left, the
 * service photo fading in from the right (stacked on mobile).
 */
export function BookingHero({
  service,
  eyebrow,
}: {
  service: Service;
  eyebrow: string;
}) {
  const media = resolveMedia(service.image);

  return (
    <section className="bg-ivory relative isolate overflow-hidden">
      {media?.url ? (
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[62%]">
          <Image
            src={media.url}
            alt={media.alt}
            fill
            preload
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="rounded-none object-cover"
          />
          <div
            aria-hidden="true"
            className="from-ivory via-ivory/40 absolute inset-0 hidden bg-gradient-to-r to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="from-ivory absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent lg:hidden"
          />
        </div>
      ) : null}

      <Container className="relative py-10 lg:py-24">
        <div className="flex max-w-md flex-col gap-3">
          <Text size="sm" tone="olive" className="tracking-[0.3em] uppercase">
            {eyebrow}
          </Text>
          <Heading as="h1" size="lg">
            {service.name}
          </Heading>
          {service.tagline ? (
            <Script className="text-gold-dark -mt-1 text-3xl">
              {service.tagline}
            </Script>
          ) : null}
          {service.shortDescription ? (
            <Text tone="muted" className="mt-2">
              {service.shortDescription}
            </Text>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
