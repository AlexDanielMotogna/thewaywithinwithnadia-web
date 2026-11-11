import type { TypedLocale } from "payload";
import { cn } from "@/lib/cn";
import {
  Container,
  Eyebrow,
  Heading,
  Icon,
  Image,
  LinkButton,
  Text,
} from "@/ui";
import { localizeHref } from "@/modules/content/ui/localize-href";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { CtaBlockData } from "@/modules/content/ui/types";

type CtaProps = CtaBlockData & { locale: TypedLocale };

function Buttons({
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  locale,
  onDark,
  centered,
}: CtaProps & { onDark: boolean; centered: boolean }) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-wrap items-center gap-4",
        centered && "justify-center",
      )}
    >
      <LinkButton
        href={localizeHref(ctaHref, locale)}
        variant={onDark ? "light" : "primary"}
        size="lg"
      >
        {ctaLabel}
        <Icon name="arrowRight" size={16} />
      </LinkButton>
      {secondaryCtaLabel && secondaryCtaHref ? (
        <LinkButton
          href={localizeHref(secondaryCtaHref, locale)}
          variant="secondary"
          size="lg"
          className={cn(
            onDark && "border-ivory text-ivory hover:bg-ivory hover:text-olive",
          )}
        >
          {secondaryCtaLabel}
        </LinkButton>
      ) : null}
    </div>
  );
}

/** Closing band: cream with a photo fading in from one side. */
function LightCta(props: CtaProps) {
  const media = resolveMedia(props.backgroundImage);
  const imageOnLeft = props.imagePosition === "left";

  return (
    <section className="bg-ivory-dark relative isolate overflow-hidden">
      {media?.url ? (
        <div
          className={cn(
            "absolute inset-y-0 -z-10 w-full md:w-3/5",
            imageOnLeft ? "left-0" : "right-0",
          )}
        >
          <Image
            src={media.url}
            alt={media.alt}
            fill
            className="rounded-none object-cover"
            sizes="(min-width: 768px) 60vw, 100vw"
          />
          <div
            aria-hidden="true"
            className={cn(
              "from-ivory-dark via-ivory-dark/80 max-md:bg-ivory-dark/85 absolute inset-0 to-transparent max-md:bg-none",
              imageOnLeft
                ? "bg-gradient-to-l via-30%"
                : "bg-gradient-to-r via-30%",
            )}
          />
        </div>
      ) : null}
      <Container className="py-section-sm sm:py-section">
        <div
          className={cn(
            "flex max-w-xl flex-col",
            media?.url
              ? imageOnLeft
                ? "md:ml-auto"
                : ""
              : "mx-auto items-center text-center",
          )}
        >
          {props.eyebrow ? (
            <Eyebrow className="mb-3">{props.eyebrow}</Eyebrow>
          ) : null}
          <Heading as="h2" size="lg">
            {props.heading}
          </Heading>
          <span
            aria-hidden="true"
            className={cn(
              "bg-terracotta-light/60 mt-4 h-px w-14",
              !media?.url && "mx-auto",
            )}
          />
          {props.body ? (
            <Text size="lg" tone="muted" className="mt-5">
              {props.body}
            </Text>
          ) : null}
          <Buttons {...props} onDark={false} centered={!media?.url} />
        </div>
      </Container>
    </section>
  );
}

/** The original olive band, kept as an option. */
function OliveCta(props: CtaProps) {
  return (
    <section className="bg-olive relative overflow-hidden">
      <Container
        size="narrow"
        className="relative flex flex-col items-center py-16 text-center sm:py-20"
      >
        <Heading as="h2" size="lg" className="text-ivory">
          {props.heading}
        </Heading>
        {props.body ? (
          <Text size="lg" tone="inverted" className="mt-4 max-w-xl">
            {props.body}
          </Text>
        ) : null}
        <Buttons {...props} onDark centered />
      </Container>
    </section>
  );
}

export function CtaBlock(props: CtaProps) {
  return props.variant === "olive" ? (
    <OliveCta {...props} />
  ) : (
    <LightCta {...props} />
  );
}
