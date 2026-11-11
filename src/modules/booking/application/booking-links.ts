import "server-only";
import { getPathname } from "@/i18n/navigation";
import { env } from "@/lib/env";
import { createManageToken } from "@/modules/booking/application/manage-token";
import type { EmailLocale } from "@/modules/booking/application/booking-emails";

// Absolute links for emails, built from the localized pathnames (no
// string-concatenated routes, ENGINEERING.md §3).

function absolute(pathname: string): URL {
  return new URL(pathname, env.NEXT_PUBLIC_SITE_URL);
}

export function manageBookingUrl(booking: {
  id: number;
  startsAt: Date;
  locale: EmailLocale;
}): string {
  const url = absolute(
    getPathname({ href: "/book/manage", locale: booking.locale }),
  );
  url.searchParams.set("token", createManageToken(booking));
  return url.toString();
}

export function bookUrl(locale: EmailLocale): string {
  return absolute(getPathname({ href: "/book", locale })).toString();
}

export function adminBookingUrl(bookingId: number): string {
  return absolute(
    `/admin/collections/bookings/${String(bookingId)}`,
  ).toString();
}
