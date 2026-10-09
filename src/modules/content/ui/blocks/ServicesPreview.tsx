import type { Service } from "@/payload-types";
import { Container, Divider, Heading, Icon, Image, Section, Text } from "@/ui";
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
          <div className="mb-10 text-center">
            <Heading as="h2" size="lg">
              {heading}
            </Heading>
            <Divider lotus className="mx-auto mt-4 w-24" />
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {list.map((service) => {
            const media = resolveMedia(service.image);
            return (
              <div key={service.id} className="flex flex-col gap-3">
                {media?.url ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
                    <Image
                      src={media.url}
                      alt={media.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : null}
                <Heading as="h3" size="sm">
                  {service.name}
                </Heading>
                <div className="relative pr-8">
                  {service.shortDescription ? (
                    <Text size="sm" tone="muted">
                      {service.shortDescription}
                    </Text>
                  ) : null}
                  <span className="border-gold text-gold absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border">
                    <Icon name="arrowRight" size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
