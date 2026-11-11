import { RichText } from "@payloadcms/richtext-lexical/react";
import type { TypedLocale } from "payload";
import { cn } from "@/lib/cn";
import { Icon, Image, LinkButton, OrnamentSpray } from "@/ui";
import { BlockHeader } from "@/modules/content/ui/blocks/block-header";
import { localizeHref } from "@/modules/content/ui/localize-href";
import { resolveMedia } from "@/modules/content/ui/resolve-media";
import type { TextImageBlockData } from "@/modules/content/ui/types";

const toneClass = { ivory: "bg-ivory", soft: "bg-ivory-dark" } as const;

export function TextImageBlock({
  eyebrow,
  heading,
  headingStyle,
  script,
  richText,
  highlight,
  image,
  imagePosition,
  imageShape,
  tone,
  asideNote,
  ctaLabel,
  ctaHref,
  locale,
}: TextImageBlockData & { locale: TypedLocale }) {
  const media = resolveMedia(image);
  const imageOnLeft = imagePosition === "left";
  const shape = imageShape ?? "bleed";

  const copy = (
    <div className="relative flex max-w-xl flex-col">
      <BlockHeader
        eyebrow={eyebrow}
        heading={heading}
        script={script}
        align="start"
        headingStyle={headingStyle ?? "serif"}
      />
      {richText ? (
        <div className="rich-text mt-6">
          <RichText data={richText} />
        </div>
      ) : null}
      {highlight ? (
        <p className="bg-blush/70 border-terracotta-light text-terracotta mt-6 border-l-2 px-5 py-4 font-serif text-xl leading-snug">
          {highlight}
        </p>
      ) : null}
      {ctaLabel && ctaHref ? (
        <div className="mt-8">
          <LinkButton
            href={localizeHref(ctaHref, locale)}
            variant="primary"
            size="lg"
          >
            {ctaLabel}
            <Icon name="arrowRight" size={16} />
          </LinkButton>
        </div>
      ) : null}
      {asideNote ? (
        <p className="font-script text-terracotta mt-8 max-w-60 -rotate-3 self-end text-center text-3xl leading-tight">
          {asideNote}
        </p>
      ) : null}
    </div>
  );

  if (!media?.url) {
    return (
      <section
        className={cn("relative overflow-hidden", toneClass[tone ?? "ivory"])}
      >
        <div className="py-section-sm sm:py-section mx-auto flex max-w-3xl justify-center px-6">
          {copy}
        </div>
        <OrnamentSpray side="right" className="right-0 bottom-0" />
      </section>
    );
  }

  const photo =
    shape === "bleed" ? (
      <div className="relative min-h-[320px] md:min-h-[460px]">
        <Image
          src={media.url}
          alt={media.alt}
          fill
          className="rounded-none object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
    ) : (
      <div className="flex items-center justify-center px-6 pt-12 md:py-16 lg:px-12">
        <div
          className={cn(
            "relative w-full max-w-md overflow-hidden",
            shape === "arch"
              ? "aspect-[4/5] rounded-t-full"
              : "aspect-[4/3] rounded-md",
          )}
        >
          <Image
            src={media.url}
            alt={media.alt}
            fill
            className="rounded-none object-cover"
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </div>
      </div>
    );

  return (
    <section className={cn("relative", toneClass[tone ?? "ivory"])}>
      <div className="grid grid-cols-1 items-stretch md:grid-cols-2">
        <div className={cn(imageOnLeft ? "md:order-1" : "md:order-2")}>
          {photo}
        </div>
        <div
          className={cn(
            "relative flex items-center overflow-hidden px-6 py-14 sm:px-10 lg:px-16 lg:py-20",
            imageOnLeft ? "md:order-2" : "md:order-1 md:justify-end",
          )}
        >
          {copy}
        </div>
      </div>
    </section>
  );
}
