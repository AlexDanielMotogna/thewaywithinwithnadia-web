import type { TypedLocale } from "payload";

/**
 * Prefixes a CMS-authored path (e.g. "/journey-to-self", a free-text field
 * in Payload) with the current locale. Content-authored hrefs aren't typed
 * next-intl Pathnames keys, so they can't go through next-intl's own
 * `Link`/`getPathname` — this is a plain, deliberately simple prefix since
 * every canonical path a content editor can currently reference
 * (src/i18n/routing.ts) happens to share the same slug across locales; only
 * the legal pages differ, and those are never CMS-authored hrefs.
 */
export function localizeHref(href: string, locale: TypedLocale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  return `/${locale}${href}`;
}
