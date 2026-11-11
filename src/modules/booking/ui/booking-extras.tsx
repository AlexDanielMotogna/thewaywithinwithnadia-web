import { resolveMedia } from "@/modules/content";
import type { BookingPage } from "@/payload-types";
import { Container, Heading, Icon, Image, Text } from "@/ui";

/** "What to expect" and "Before you book", editable in the Booking page global. */
export function BookingExtras({
  content,
  whatToExpectTitle,
}: {
  content: BookingPage;
  whatToExpectTitle: string;
}) {
  const items = content.whatToExpect ?? [];
  const before = content.beforeYouBook;
  const beforeImage = resolveMedia(before?.image);

  return (
    <>
      {items.length > 0 ? (
        <section aria-labelledby="what-to-expect" className="py-16">
          <Container>
            <Heading as="h2" size="sm" id="what-to-expect">
              {whatToExpectTitle}
            </Heading>
            <span
              aria-hidden="true"
              className="bg-gold mt-2 mb-10 block h-px w-10"
            />
            <ul className="divide-sand-dark grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x">
              {items.map((item) => (
                <li
                  key={item.id ?? item.title}
                  className="flex flex-col items-center gap-3 px-6 text-center"
                >
                  <span
                    aria-hidden="true"
                    className="bg-sand text-gold-dark flex size-16 items-center justify-center rounded-full"
                  >
                    <Icon name={item.icon} size={28} />
                  </span>
                  <h3 className="text-olive font-serif text-xl">
                    {item.title}
                  </h3>
                  <Text size="sm" tone="muted">
                    {item.text}
                  </Text>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {before?.title && before.text ? (
        <section aria-labelledby="before-you-book" className="pb-20">
          <Container>
            <div className="bg-sand/40 grid overflow-hidden rounded-md md:grid-cols-[2fr_3fr]">
              {beforeImage?.url ? (
                <div className="relative aspect-[16/9] md:aspect-auto">
                  <Image
                    src={beforeImage.url}
                    alt={beforeImage.alt}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="rounded-none object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-3 p-8 sm:p-10">
                <Heading as="h2" size="sm" id="before-you-book">
                  {before.title}
                </Heading>
                <span aria-hidden="true" className="bg-gold block h-px w-10" />
                <Text tone="muted">{before.text}</Text>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
