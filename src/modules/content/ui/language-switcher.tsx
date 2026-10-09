"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

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
              router.replace(pathname, { locale: loc });
            }}
            aria-current={loc === locale ? "true" : undefined}
            className={cn(
              "uppercase",
              loc === locale
                ? "text-olive font-semibold"
                : "text-charcoal/60 hover:text-olive",
            )}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
