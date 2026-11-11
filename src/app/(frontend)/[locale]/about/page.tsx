import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/modules/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata({ slug: "about", pathname: "/about", locale });
}

export default async function AboutMe({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  return <CmsPage slug="about" locale={locale} />;
}
