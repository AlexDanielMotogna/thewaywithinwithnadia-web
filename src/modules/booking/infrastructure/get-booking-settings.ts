import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import type { BookingSetting } from "@/payload-types";

export async function getBookingSettings(): Promise<BookingSetting> {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "booking-settings" });
}
