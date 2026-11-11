import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/modules/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/safety-wellbeing">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata({
    slug: "safety-wellbeing",
    pathname: "/safety-wellbeing",
    locale,
  });
}

export default async function SafetyAndWellbeing({
  params,
}: PageProps<"/[locale]/safety-wellbeing">) {
  const { locale } = await params;
  return <CmsPage slug="safety-wellbeing" locale={locale} />;
}
