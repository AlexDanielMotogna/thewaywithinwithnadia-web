import type { Page } from "@/payload-types";

export type PageBlock = NonNullable<Page["blocks"]>[number];

export type HeroBlockData = Extract<PageBlock, { blockType: "hero" }>;
export type QuoteBlockData = Extract<PageBlock, { blockType: "quote" }>;
export type TextImageBlockData = Extract<PageBlock, { blockType: "textImage" }>;
export type PrinciplesBlockData = Extract<
  PageBlock,
  { blockType: "principles" }
>;
export type ServicesPreviewBlockData = Extract<
  PageBlock,
  { blockType: "servicesPreview" }
>;
export type CtaBlockData = Extract<PageBlock, { blockType: "cta" }>;
export type NoticeBlockData = Extract<PageBlock, { blockType: "notice" }>;
