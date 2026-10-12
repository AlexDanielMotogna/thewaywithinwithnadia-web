import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";
import type { BookingStatus } from "@/modules/booking/domain/state-machine";

export async function updateBookingStatus(
  id: number,
  status: BookingStatus,
): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({ collection: "bookings", id, data: { status } });
}
