import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { Footer, SiteHeader } from "@/modules/content";
import "../../globals.css";

export const metadata: Metadata = {
  title: "The Way Within with Nadia",
  description: "A sacred space to meet yourself.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see src/i18n/request.ts
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="bg-ivory text-charcoal flex min-h-full flex-col">
        <NextIntlClientProvider>
          <SiteHeader />
          {/* Skip-link target. A wrapper (not each page's <main>) so every
              route gets it, including the booking pages. */}
          <div id="main" tabIndex={-1} className="flex flex-1 flex-col">
            {children}
          </div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
