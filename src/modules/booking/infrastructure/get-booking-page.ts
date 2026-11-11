import "server-only";
import { cacheLife } from "next/cache";
import config from "@payload-config";
import { getPayload } from "payload";
import type { BookingPage } from "@/payload-types";
import type { ContentLocale } from "@/modules/booking/infrastructure/list-bookable-services";

export async function getBookingPage(
  locale: ContentLocale,
): Promise<BookingPage> {
  "use cache";
  cacheLife("minutes");

  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "booking-page", locale, depth: 1 });
}
