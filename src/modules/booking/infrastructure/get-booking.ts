import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import type { Booking } from "@/payload-types";

export async function getBookingById(id: number): Promise<Booking | null> {
  const payload = await getPayload({ config });
  try {
    return await payload.findByID({ collection: "bookings", id });
  } catch {
    return null;
  }
}
