import type { Service } from "@/payload-types";
import { Container, Heading, Image, Section, Stack, Text } from "@/ui";
import { getFeaturedServices } from "@/modules/content/infrastructure/get-featured-services";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { ServicesPreviewBlockData } from "@/modules/content/ui/types";

function isPopulatedService(value: number | Service): value is Service {
  return typeof value === "object";
}

export async function ServicesPreviewBlock({
  heading,
  services,
}: ServicesPreviewBlockData) {
  const populated = services?.filter(isPopulatedService) ?? [];
  const list = populated.length > 0 ? populated : await getFeaturedServices();

  if (list.length === 0) return null;

  return (
    <Section tone="ivory">
      <Container>
        {heading ? (
          <Heading as="h2" size="lg" className="mb-10 text-center">
            {heading}
          </Heading>
        ) : null}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((service) => {
            const media = resolveMedia(service.image);
            return (
              <Stack key={service.id} gap="sm">
                {media?.url ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                    <Image
                      src={media.url}
                      alt={media.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : null}
                <Heading as="h3" size="sm">
                  {service.name}
                </Heading>
                {service.shortDescription ? (
                  <Text tone="muted">{service.shortDescription}</Text>
                ) : null}
              </Stack>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
