import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import { Container, Icon, Script, Text } from "@/ui";
import { getSiteSettings } from "@/modules/content/infrastructure/get-site-settings";
import { LanguageSwitcher } from "@/modules/content/ui/language-switcher";

const SOCIAL_BADGE_CLASS =
  "bg-olive text-ivory hover:bg-olive-light flex h-9 w-9 items-center justify-center rounded-full";

export async function Footer() {
  const [settings, t] = await Promise.all([
    getSiteSettings(),
    getTranslations(),
  ]);
  const instagramUrl = settings.socialLinks?.find(
    (link) => link.platform === "instagram",
  )?.url;

  const navLinks: {
    label: string;
    href: "/" | "/journey-to-self" | "/hotels-spas" | "/contact";
  }[] = [
    { label: t("Nav.home"), href: "/" },
    { label: t("Nav.journeyToSelf"), href: "/journey-to-self" },
    { label: t("Nav.hotelsSpas"), href: "/hotels-spas" },
    { label: t("Nav.contact"), href: "/contact" },
  ];

  // Required on every page footer per LEGAL.md §6.1 ("leicht und
  // unmittelbar erreichbar"). Routes aren't built yet (real content is
  // pending Nadia + a lawyer — PENDING.md); these are placeholders so the
  // links are visually present, not a claim that the pages exist.
  const legalLinks: { label: string; href: "/impressum" | "/datenschutz" }[] = [
    { label: t("Footer.impressum"), href: "/impressum" },
    { label: t("Footer.datenschutz"), href: "/datenschutz" },
  ];

  return (
    <footer className="bg-ivory border-sand border-t">
      <Container size="wide" className="py-10">
        <div className="grid grid-cols-1 items-center gap-6 text-center sm:grid-cols-4 sm:text-left">
          <div>
            <Text
              as="span"
              size="lg"
              className="text-olive-dark block font-serif font-semibold tracking-wide uppercase"
            >
              The Way Within
            </Text>
            <Script className="text-gold-dark text-xl">with Nadia</Script>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:col-span-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-charcoal/80 hover:text-olive text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <LanguageSwitcher />
            {instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={SOCIAL_BADGE_CLASS}
              >
                <Icon name="instagram" size={16} />
              </a>
            ) : (
              <span
                aria-hidden="true"
                className={cn(SOCIAL_BADGE_CLASS, "pointer-events-none")}
              >
                <Icon name="instagram" size={16} />
              </span>
            )}
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                aria-label="Email"
                className={SOCIAL_BADGE_CLASS}
              >
                <Icon name="mail" size={16} />
              </a>
            ) : (
              <span
                aria-hidden="true"
                className={cn(SOCIAL_BADGE_CLASS, "pointer-events-none")}
              >
                <Icon name="mail" size={16} />
              </span>
            )}
          </div>
        </div>
        <nav
          aria-label="Legal"
          className="border-sand/70 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-6"
        >
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-charcoal/60 hover:text-olive text-xs tracking-wide uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
