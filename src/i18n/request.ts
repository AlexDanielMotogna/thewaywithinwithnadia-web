import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import en from "../messages/en.json";
import de from "../messages/de.json";

// Static imports (not a dynamic `import(\`./${locale}.json\`)`) are
// properly typed from the JSON content — a dynamic path is untypeable
// (resolves to `any`), which our lint forbids propagating.
const messagesByLocale = { en, de } satisfies Record<
  (typeof routing.locales)[number],
  Record<string, unknown>
>;

// `next/root-params` is next-intl's recommended replacement for
// `requestLocale`, but its type generation doesn't detect `[locale]` when
// it's nested inside a route group (`(frontend)/[locale]/`) — confirmed via
// `.next/types/root-params.d.ts` still saying "No root params detected"
// even after a full successful `next build` that correctly generated /en
// and /de routes. That leaves every root-params import typed `any`, which
// is worse than this deprecation. See BUGS.md.
// eslint-disable-next-line @typescript-eslint/no-deprecated
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return { locale, messages: messagesByLocale[locale] };
});
