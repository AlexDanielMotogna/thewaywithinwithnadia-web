/**
 * Main navigation, in order (client mockups, 2026-11 — condensed to six
 * pages; "The Experience" lives inside "What I Offer"). Labels come from
 * `Nav.<key>` in messages; header and footer both read this list.
 */
export const MAIN_NAV = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "philosophy", href: "/philosophy" },
  { key: "services", href: "/services" },
  { key: "safety", href: "/safety-wellbeing" },
  { key: "contact", href: "/contact" },
] as const;

export type NavHref = (typeof MAIN_NAV)[number]["href"];
export type NavItem = { href: NavHref; label: string };
