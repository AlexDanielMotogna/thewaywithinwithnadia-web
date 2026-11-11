import type { TypedLocale } from "payload";
import { cn } from "@/lib/cn";
import {
  Container,
  Divider,
  Eyebrow,
  Heading,
  Icon,
  Image,
  LinkButton,
  OrnamentSpray,
  Text,
} from "@/ui";
import { localizeHref } from "@/modules/content/ui/localize-href";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { HeroBlockData } from "@/modules/content/ui/types";

type HeroProps = HeroBlockData & { locale: TypedLocale };

function HeroCopy({
  eyebrow,
  heading,
  script,
  tagline,
  subheading,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  locale,
  align,
  headingSize,
}: HeroProps & { align: "start" | "center"; headingSize: "lg" | "xl" }) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start text-left",
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      {!centered && eyebrow ? (
        <span aria-hidden="true" className="bg-terracotta-light/60 h-px w-14" />
      ) : null}
      <Heading as="h1" size={headingSize}>
        {heading}
      </Heading>
      {script ? (
        <p className="font-script text-terracotta -mt-1 text-3xl leading-snug sm:text-4xl">
          {script}
        </p>
      ) : null}
      {centered ? <Divider lotus tone="terracotta" className="w-28" /> : null}
      {tagline ? (
        <p className="text-olive-dark/80 text-xs font-medium tracking-[0.28em] uppercase sm:text-sm">
          {tagline}
        </p>
      ) : null}
      {subheading ? (
        <Text size="lg" tone="muted" className="max-w-xl">
          {subheading}
        </Text>
      ) : null}
      {(primaryCtaLabel && primaryCtaHref) ||
      (secondaryCtaLabel && secondaryCtaHref) ? (
        <div
          className={cn(
            "mt-4 flex flex-wrap items-center gap-4",
            centered && "justify-center",
          )}
        >
          {primaryCtaLabel && primaryCtaHref ? (
            <LinkButton
              href={localizeHref(primaryCtaHref, locale)}
              variant="primary"
              size="lg"
            >
              {primaryCtaLabel}
              <Icon name="arrowRight" size={16} />
            </LinkButton>
          ) : null}
          {secondaryCtaLabel && secondaryCtaHref ? (
            <LinkButton
              href={localizeHref(secondaryCtaHref, locale)}
              variant="secondary"
              size="lg"
            >
              {secondaryCtaLabel}
            </LinkButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Home: full-bleed photo, copy on the right over a soft ivory wash. */
function OverlayHero(props: HeroProps) {
  const media = resolveMedia(props.image);
  return (
    <section className="relative isolate overflow-hidden lg:min-h-[78vh]">
      {media?.url ? (
        <div className="relative h-[46vh] min-h-[300px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src={media.url}
            alt={media.alt}
            fill
            preload
            sizes="100vw"
            className="rounded-none object-cover"
          />
          <div
            aria-hidden="true"
            className="from-ivory via-ivory/70 absolute inset-0 hidden bg-gradient-to-l via-35% to-transparent to-70% lg:block"
          />
          <div
            aria-hidden="true"
            className="from-ivory absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent lg:hidden"
          />
        </div>
      ) : null}
      <Container
        size="wide"
        className="relative flex py-12 lg:min-h-[78vh] lg:items-center lg:justify-end lg:py-20"
      >
        <div className="w-full lg:max-w-xl xl:mr-8">
          <HeroCopy {...props} align="center" headingSize="xl" />
        </div>
      </Container>
    </section>
  );
}

/** Inner pages: copy left on ivory, photo right fading into it. */
function SplitHero(props: HeroProps) {
  const media = resolveMedia(props.image);
  return (
    <section className="bg-ivory relative isolate overflow-hidden">
      <div className="grid lg:min-h-[480px] lg:grid-cols-2">
        <div className="relative order-2 flex items-center px-6 py-12 sm:px-10 lg:order-1 lg:py-20 lg:pr-4 lg:pl-[max(3rem,calc((100vw-72rem)/2+3rem))]">
          <HeroCopy {...props} align="start" headingSize="xl" />
        </div>
        {media?.url ? (
          <div className="relative order-1 h-[38vh] min-h-[260px] lg:order-2 lg:h-auto">
            <Image
              src={media.url}
              alt={media.alt}
              fill
              preload
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-none object-cover"
            />
            <div
              aria-hidden="true"
              className="from-ivory absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r to-transparent lg:block"
            />
            <div
              aria-hidden="true"
              className="from-ivory absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent lg:hidden"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Text-only intro with botanical corners (e.g. What I Offer). */
function CenteredHero(props: HeroProps) {
  return (
    <section className="bg-ivory relative isolate overflow-hidden">
      <OrnamentSpray side="left" className="top-0 left-0" />
      <OrnamentSpray side="right" className="right-0 bottom-0" />
      <Container size="narrow" className="py-section-sm sm:py-section">
        <HeroCopy {...props} align="center" headingSize="xl" />
      </Container>
    </section>
  );
}

export function HeroBlock(props: HeroProps) {
  switch (props.layout ?? "split") {
    case "overlay":
      return <OverlayHero {...props} />;
    case "centered":
      return <CenteredHero {...props} />;
    case "split":
      return <SplitHero {...props} />;
  }
}
