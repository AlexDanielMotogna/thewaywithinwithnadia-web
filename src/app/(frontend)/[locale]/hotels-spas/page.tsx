import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CmsPage, cmsPageMetadata } from "@/modules/content";
import { EnquiryForm } from "@/modules/enquiries";
import { Container, Divider, Eyebrow, Heading, Section } from "@/ui";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/hotels-spas">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata({
    slug: "hotels-spas",
    pathname: "/hotels-spas",
    locale,
  });
}

export default async function HotelsAndSpas({
  params,
}: PageProps<"/[locale]/hotels-spas">) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <CmsPage slug="hotels-spas" locale={locale}>
      <Section tone="soft" id="enquiry">
        <Container size="narrow" className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <Eyebrow>{t("Enquiry.formEyebrow")}</Eyebrow>
            <Heading as="h2" size="lg">
              {t("Enquiry.formTitle")}
            </Heading>
            <Divider lotus tone="terracotta" className="w-32" />
          </div>
          <EnquiryForm />
        </Container>
      </Section>
    </CmsPage>
  );
}
