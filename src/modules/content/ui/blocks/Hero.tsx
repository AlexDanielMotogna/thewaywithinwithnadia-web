import { Container, Heading, Image, LinkButton, Script, Text } from "@/ui";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { HeroBlockData } from "@/modules/content/ui/types";

/** Sunburst + arc ornament above the hero heading (Master Doc §3 motif). */
function HeroOrnament() {
  return (
    <svg
      viewBox="0 0 120 56"
      className="text-gold h-10 w-28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path d="M10 40a50 50 0 0 1 100 0" />
      <circle cx="60" cy="40" r="9" />
      <path d="M60 25v4M60 51v4M43 40h-4M121 40h-4" />
      <path
        d="M60 2l2 7 7-2-5 5 5 5-7-2-2 7-2-7-7 2 5-5-5-5 7 2 2-7Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function HeroBlock({
  heading,
  script,
  tagline,
  subheading,
  image,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: HeroBlockData) {
  const media = resolveMedia(image);
  const hasPrimaryCta = Boolean(primaryCtaLabel && primaryCtaHref);
  const hasSecondaryCta = Boolean(secondaryCtaLabel && secondaryCtaHref);

  return (
    <section className="relative isolate flex min-h-[640px] flex-col overflow-hidden sm:min-h-[85vh]">
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          preload
          sizes="100vw"
          className="rounded-none object-cover"
        />
      ) : (
        <div className="bg-sand absolute inset-0" />
      )}
      <div className="from-ivory/80 via-ivory/15 to-ivory/55 absolute inset-0 bg-gradient-to-b" />

      <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="text-charcoal/70 font-serif text-xs tracking-[0.3em] uppercase drop-shadow-xs sm:text-sm">
          The Way Within
        </span>
        {secondaryCtaLabel && secondaryCtaHref ? (
          <LinkButton href={secondaryCtaHref} variant="primary" size="sm">
            {secondaryCtaLabel}
          </LinkButton>
        ) : null}
      </div>

      <Container
        size="narrow"
        className="relative z-10 flex flex-1 flex-col items-center justify-center py-10 text-center"
      >
        <HeroOrnament />
        <Heading as="h1" size="xl" className="mt-2">
          {heading}
        </Heading>
        {script ? <Script className="-mt-2 text-3xl">{script}</Script> : null}
        {tagline ? (
          <Text
            size="sm"
            tone="olive"
            className="mt-4 tracking-[0.25em] uppercase"
          >
            {tagline}
          </Text>
        ) : null}
        {subheading ? (
          <Text size="base" tone="muted" className="mt-3 max-w-xl">
            {subheading}
          </Text>
        ) : null}
        {hasPrimaryCta || hasSecondaryCta ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {primaryCtaLabel && primaryCtaHref ? (
              <LinkButton href={primaryCtaHref} variant="primary" size="lg">
                {primaryCtaLabel}
              </LinkButton>
            ) : null}
            {secondaryCtaLabel && secondaryCtaHref ? (
              <LinkButton href={secondaryCtaHref} variant="secondary" size="lg">
                {secondaryCtaLabel}
              </LinkButton>
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
