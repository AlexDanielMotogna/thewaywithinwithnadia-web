import { Playfair_Display, Inter, Allura } from "next/font/google";

/**
 * Typography per ENGINEERING.md §1 / Master Doc §3.
 * Primary serif: Playfair Display (editorial, high-contrast, premium headings).
 * Secondary sans: Inter (clean, highly readable — nav, body, forms, UI).
 * Script accent: Allura ("with Nadia", selected quotes — never body/UI, see ui/Script.tsx).
 */
export const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontScript = Allura({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const fontVariables = `${fontSerif.variable} ${fontSans.variable} ${fontScript.variable}`;
