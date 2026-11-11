import { getTranslations } from "next-intl/server";
import { MAIN_NAV } from "@/modules/content/ui/nav-items";
import { SiteNav } from "@/modules/content/ui/site-nav";

/** Sticky site header on every public page: logo, main nav, Book CTA, EN/DE. */
export async function SiteHeader() {
  const t = await getTranslations();
  const items = MAIN_NAV.map((item) => ({
    href: item.href,
    label: t(`Nav.${item.key}`),
  }));

  return (
    <>
      <a
        href="#main"
        className="bg-olive text-ivory sr-only z-50 rounded-full px-5 py-2 text-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("Nav.skipToContent")}
      </a>
      <SiteNav
        items={items}
        labels={{
          home: t("Nav.logoLabel"),
          book: t("Nav.book"),
          openMenu: t("Nav.openMenu"),
          closeMenu: t("Nav.closeMenu"),
          main: t("Nav.mainLabel"),
        }}
      />
    </>
  );
}
