import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/modules/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/philosophy">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata({
    slug: "philosophy",
    pathname: "/philosophy",
    locale,
  });
}

export default async function Philosophy({
  params,
}: PageProps<"/[locale]/philosophy">) {
  const { locale } = await params;
  return <CmsPage slug="philosophy" locale={locale} />;
}
