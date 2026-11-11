import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { buildMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";
import { getPageBySlug } from "@/modules/content/infrastructure/get-page";
import { RenderBlocks } from "@/modules/content/ui/render-blocks";

type CanonicalPathname = Parameters<typeof buildMetadata>[0]["pathname"];

type CmsPageArgs = {
  /** `slug` of the Pages document in Payload. */
  slug: string;
  /** Canonical route key from src/i18n/routing.ts. */
  pathname: CanonicalPathname;
  locale: string;
};

/** Metadata for a page whose content is a Pages document (block builder). */
export async function cmsPageMetadata({
  slug,
  pathname,
  locale,
}: CmsPageArgs): Promise<Metadata> {
  if (!hasLocale(routing.locales, locale)) notFound();
  const page = await getPageBySlug(slug, locale);
  if (!page) notFound();

  return buildMetadata({
    pathname,
    locale,
    title: page.seo?.title ?? page.title,
    description: page.seo?.description ?? undefined,
  });
}

/**
 * A page rendered from CMS blocks. `children` is a code-owned section (e.g.
 * a form), placed after the first `childrenAfter` blocks — after all of
 * them by default.
 */
export async function CmsPage({
  slug,
  locale,
  children,
  childrenAfter,
}: Omit<CmsPageArgs, "pathname"> & {
  children?: ReactNode;
  childrenAfter?: number;
}) {
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  const page = await getPageBySlug(slug, locale);
  if (!page?.blocks || page.blocks.length === 0) notFound();

  return (
    <main className="flex-1">
      <RenderBlocks
        blocks={page.blocks.slice(0, childrenAfter)}
        locale={locale}
      />
      {children}
      {childrenAfter === undefined ? null : (
        <RenderBlocks
          blocks={page.blocks.slice(childrenAfter)}
          locale={locale}
        />
      )}
    </main>
  );
}
