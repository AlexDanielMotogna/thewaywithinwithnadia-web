import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const PAGES = [
  "/",
  "/about",
  "/philosophy",
  "/services",
  "/safety-wellbeing",
  "/hotels-spas",
  "/contact",
  "/book",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((pathname) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = new URL(
        getPathname({ href: pathname, locale }),
        env.NEXT_PUBLIC_SITE_URL,
      ).toString();
    }

    return {
      url: new URL(
        getPathname({ href: pathname, locale: routing.defaultLocale }),
        env.NEXT_PUBLIC_SITE_URL,
      ).toString(),
      lastModified: new Date(),
      alternates: { languages },
    };
  });
}
