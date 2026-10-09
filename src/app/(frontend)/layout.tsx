import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "The Way Within with Nadia",
  description: "A sacred space to meet yourself.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="bg-ivory text-charcoal flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
