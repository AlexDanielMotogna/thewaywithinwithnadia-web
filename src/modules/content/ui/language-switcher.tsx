"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ service?: string }>();

  // Same page in the other language; a dynamic route needs its params.
  function switchTo(loc: (typeof routing.locales)[number]) {
    if (pathname === "/book/[service]") {
      if (params.service) {
        router.replace(
          { pathname, params: { service: params.service } },
          { locale: loc },
        );
      } else {
        router.replace("/book", { locale: loc });
      }
      return;
    }
    router.replace(pathname, { locale: loc });
  }

  return (
    <div
      className="flex items-center gap-1 text-sm"
      aria-label="Language switcher"
    >
      {routing.locales.map((loc, index) => (
        <span key={loc} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden="true" className="text-charcoal/30">
              /
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => {
              switchTo(loc);
            }}
            aria-current={loc === locale ? "true" : undefined}
            className={cn(
              "uppercase",
              loc === locale
                ? "text-olive font-semibold"
                : "text-charcoal/70 hover:text-olive",
            )}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
