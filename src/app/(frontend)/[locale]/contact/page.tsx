import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ContactForm } from "@/modules/contact";
import { CmsPage, cmsPageMetadata, getSiteSettings } from "@/modules/content";
import {
  Container,
  Heading,
  Icon,
  IconBadge,
  Section,
  type IconName,
} from "@/ui";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata({ slug: "contact", pathname: "/contact", locale });
}

function Channel({
  icon,
  title,
  body,
  children,
}: {
  icon: IconName;
  title: string;
  body?: string;
  children: ReactNode;
}) {
  return (
    <li className="flex gap-5">
      <IconBadge name={icon} />
      <div className="flex flex-col gap-1">
        <h3 className="text-olive-dark font-serif text-2xl font-medium">
          {title}
        </h3>
        {body ? (
          <p className="text-charcoal/75 text-[0.95rem] leading-relaxed">
            {body}
          </p>
        ) : null}
        {children}
      </div>
    </li>
  );
}

const channelLink =
  "text-terracotta hover:text-olive-dark mt-1 inline-flex min-h-6 items-center gap-1.5 underline underline-offset-4";

export default async function Contact({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getTranslations(),
  ]);

  return (
    <CmsPage slug="contact" locale={locale} childrenAfter={1}>
      <Section tone="ivory" spacing="sm">
        <Container className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Heading as="h2" size="md">
                {t("ContactPage.formTitle")}
              </Heading>
              <span
                aria-hidden="true"
                className="bg-terracotta-light/60 h-px w-14"
              />
            </div>
            <ContactForm />
          </div>

          <div className="border-sand-dark/60 flex flex-col gap-6 lg:border-l lg:pl-16">
            <div className="flex flex-col gap-3">
              <Heading as="h2" size="md">
                {t("ContactPage.otherTitle")}
              </Heading>
              <span
                aria-hidden="true"
                className="bg-terracotta-light/60 h-px w-14"
              />
            </div>
            <ul className="flex flex-col gap-9">
              {settings.email ? (
                <Channel
                  icon="mail"
                  title={t("ContactPage.emailTitle")}
                  body={t("ContactPage.emailBody")}
                >
                  <a href={`mailto:${settings.email}`} className={channelLink}>
                    {settings.email}
                  </a>
                </Channel>
              ) : null}
              {settings.phone ? (
                <Channel icon="chat" title={t("ContactPage.phoneTitle")}>
                  <a href={`tel:${settings.phone}`} className={channelLink}>
                    {settings.phone}
                  </a>
                </Channel>
              ) : null}
              <Channel
                icon="calendar"
                title={t("ContactPage.bookTitle")}
                body={t("ContactPage.bookBody")}
              >
                <Link href="/book" className={channelLink}>
                  {t("ContactPage.bookCta")}
                  <Icon name="arrowRight" size={14} />
                </Link>
              </Channel>
              <Channel
                icon="users"
                title={t("ContactPage.collabTitle")}
                body={t("ContactPage.collabBody")}
              >
                <Link href="/hotels-spas" className={channelLink}>
                  {t("ContactPage.collabCta")}
                  <Icon name="arrowRight" size={14} />
                </Link>
              </Channel>
            </ul>
          </div>
        </Container>
      </Section>
    </CmsPage>
  );
}
