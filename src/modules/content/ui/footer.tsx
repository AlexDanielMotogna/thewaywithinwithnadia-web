import Link from "next/link";
import { cn } from "@/lib/cn";
import { Container, Icon, Script, Text } from "@/ui";
import { getSiteSettings } from "@/modules/content/infrastructure/get-site-settings";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Journey to Self", href: "/journey-to-self" },
  { label: "Hotels & Spas", href: "/hotels-spas" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_BADGE_CLASS =
  "bg-olive text-ivory hover:bg-olive-light flex h-9 w-9 items-center justify-center rounded-full";

export async function Footer() {
  const settings = await getSiteSettings();
  const instagramUrl = settings.socialLinks?.find(
    (link) => link.platform === "instagram",
  )?.url;

  return (
    <footer className="bg-ivory border-sand border-t">
      <Container
        size="wide"
        className="grid grid-cols-1 items-center gap-6 py-10 text-center sm:grid-cols-3 sm:text-left"
      >
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
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-charcoal/80 hover:text-olive text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-center gap-3 sm:justify-end">
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
      </Container>
    </footer>
  );
}
