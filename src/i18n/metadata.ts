import type { Metadata } from "next";
import { env } from "@/lib/env";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type CanonicalPathname = Parameters<typeof getPathname>[0]["href"];
type Locale = (typeof routing.locales)[number];

type BuildMetadataArgs = {
  /** One of the canonical keys in src/i18n/routing.ts's `pathnames` map. */
  pathname: CanonicalPathname;
  locale: Locale;
  title: string;
  description?: string | undefined;
};

/** One shared helper for title/description/canonical/OG/hreflang on every page. */
export function buildMetadata({
  pathname,
  locale,
  title,
  description,
}: BuildMetadataArgs): Metadata {
  const absoluteUrl = (forLocale: Locale) =>
    new URL(
      getPathname({ href: pathname, locale: forLocale }),
      env.NEXT_PUBLIC_SITE_URL,
    ).toString();

  const languages: Record<string, string> = {
    "x-default": absoluteUrl(routing.defaultLocale),
  };
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(loc);
  }

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(locale),
      languages,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale),
      siteName: "The Way Within with Nadia",
      locale,
      type: "website",
    },
  };
}
