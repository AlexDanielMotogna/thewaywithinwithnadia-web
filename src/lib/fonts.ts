import { Cormorant_Garamond, Inter, Allura } from "next/font/google";

/**
 * Typography per ENGINEERING.md §1 / Master Doc §3.
 * Primary serif: Cormorant Garamond — the lighter classical serif of the
 * client's "Website Structure" mockups (2026-11); replaced Playfair Display.
 * Secondary sans: Inter (clean, highly readable — nav, body, forms, UI).
 * Script accent: Allura ("with Nadia", selected quotes — never body/UI, see ui/Script.tsx).
 */
export const fontSerif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
