import { defineRouting } from "next-intl/routing";

/**
 * Canonical pathnames (used everywhere in code) mapped to the per-locale
 * URL. Most pages keep the same slug in both locales for now — full DE
 * slug translation is tied to real DE content landing (PENDING.md #7),
 * not worth doing in isolation. The legal pages are the exception: the
 * German terms are mandatory (LEGAL.md §6.1), not a translation choice.
 */
export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/about": "/about",
    "/philosophy": "/philosophy",
    "/services": "/services",
    "/safety-wellbeing": "/safety-wellbeing",
    "/hotels-spas": "/hotels-spas",
    "/contact": "/contact",
    "/book": "/book",
    "/book/manage": "/book/manage",
    "/book/[service]": "/book/[service]",
    "/impressum": { en: "/imprint", de: "/impressum" },
    "/datenschutz": { en: "/privacy", de: "/datenschutz" },
  },
});
