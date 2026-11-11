import "server-only";
import type { BookingEmailFacts } from "@/modules/booking/application/booking-emails";
import { getServiceById } from "@/modules/booking/infrastructure/get-service";
import type { Booking } from "@/payload-types";

export function serviceIdOf(booking: Booking): number {
  return typeof booking.service === "number"
    ? booking.service
    : booking.service.id;
}

/** Everything the emails say about a booking, from its own snapshot fields. */
export async function loadBookingEmailFacts(
  booking: Booking,
  timezone: string,
): Promise<BookingEmailFacts> {
  const service = await getServiceById(serviceIdOf(booking));
  return {
    locale: booking.locale,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientPhone: booking.clientPhone ?? null,
    notes: booking.notes ?? null,
    serviceName: service?.name ?? "Session",
    startsAt: new Date(booking.startsAt),
    durationMin: booking.durationMin,
    timezone,
    mode: booking.mode,
    priceAmount: booking.priceAmount ?? null,
    currency: booking.currency ?? "EUR",
    meetingUrl: booking.meetingUrl ?? null,
  };
}
