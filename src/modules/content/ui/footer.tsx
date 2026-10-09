import Link from "next/link";
import { Container, Icon, Script, Text } from "@/ui";
import { getSiteSettings } from "@/modules/content/infrastructure/get-site-settings";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Journey to Self", href: "/journey-to-self" },
  { label: "Hotels & Spas", href: "/hotels-spas" },
  { label: "Contact", href: "/contact" },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const hasSocial = Boolean(settings.socialLinks?.length ?? settings.email);

  return (
    <footer className="bg-ivory border-sand border-t">
      <Container className="flex flex-col items-center gap-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <Text as="span" size="lg" tone="olive" className="block font-serif">
            The Way Within
          </Text>
          <Script className="text-xl">with Nadia</Script>
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
        {hasSocial ? (
          <div className="flex items-center gap-3">
            {settings.socialLinks
              ?.filter((link) => link.platform === "instagram")
              .map((link) => (
                <a
                  key={link.id ?? link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="bg-olive text-ivory hover:bg-olive-light flex h-9 w-9 items-center justify-center rounded-full"
                >
                  <Icon name="instagram" size={16} />
                </a>
              ))}
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                aria-label="Email"
                className="bg-olive text-ivory hover:bg-olive-light flex h-9 w-9 items-center justify-center rounded-full"
              >
                <Icon name="mail" size={16} />
              </a>
            ) : null}
          </div>
        ) : null}
      </Container>
    </footer>
  );
}
