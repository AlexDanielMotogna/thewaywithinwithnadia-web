import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/modules/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata({ slug: "services", pathname: "/services", locale });
}

export default async function WhatIOffer({
  params,
}: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  return <CmsPage slug="services" locale={locale} />;
}
