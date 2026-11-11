import type { TypedLocale } from "payload";
import { CtaBlock } from "@/modules/content/ui/blocks/Cta";
import { HeroBlock } from "@/modules/content/ui/blocks/Hero";
import { NoticeBlock } from "@/modules/content/ui/blocks/Notice";
import { PrinciplesBlock } from "@/modules/content/ui/blocks/Principles";
import { QuoteBlock } from "@/modules/content/ui/blocks/Quote";
import { ServicesPreviewBlock } from "@/modules/content/ui/blocks/ServicesPreview";
import { TextImageBlock } from "@/modules/content/ui/blocks/TextImage";
import type { PageBlock } from "@/modules/content/ui/types";

/**
 * A switch, not the `satisfies`-registry sketched in ENGINEERING.md §3 —
 * that pattern needs a generic `ComponentType<any>` map, which this repo's
 * lint config forbids (no `any`, no `as`). `switch-exhaustiveness-check`
 * gives the same guarantee: a new block type with no case fails the build.
 */
function RenderBlock({
  block,
  locale,
}: {
  block: PageBlock;
  locale: TypedLocale;
}) {
  switch (block.blockType) {
    case "hero":
      return <HeroBlock {...block} locale={locale} />;
    case "quote":
      return <QuoteBlock {...block} />;
    case "textImage":
      return <TextImageBlock {...block} locale={locale} />;
    case "principles":
      return <PrinciplesBlock {...block} />;
    case "servicesPreview":
      return <ServicesPreviewBlock {...block} locale={locale} />;
    case "cta":
      return <CtaBlock {...block} locale={locale} />;
    case "notice":
      return <NoticeBlock {...block} locale={locale} />;
  }
}

export function RenderBlocks({
  blocks,
  locale,
}: {
  blocks: PageBlock[];
  locale: TypedLocale;
}) {
  return (
    <>
      {blocks.map((block, index) => (
        <RenderBlock
          key={block.id ?? String(index)}
          block={block}
          locale={locale}
        />
      ))}
    </>
  );
}
