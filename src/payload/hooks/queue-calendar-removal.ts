import type { CollectionAfterChangeHook } from "payload";
import { isActiveBooking } from "@/modules/booking/pure";
import type { Booking } from "@/payload-types";

/**
 * When a booking stops being active (cancelled or rescheduled), queue the
 * removal of its calendar event. Runs for every path, including a status
 * change made directly in the admin. Queued with `req`, so the job is only
 * created if the status write itself commits.
 */
export const queueCalendarRemoval: CollectionAfterChangeHook<Booking> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;
  const deactivated =
    isActiveBooking(previousDoc.status) && !isActiveBooking(doc.status);
  if (deactivated && doc.calendarEventId) {
    await req.payload.jobs.queue({
      task: "removeBookingCalendarEvent",
      input: { bookingId: doc.id },
      req,
    });
  }
  return doc;
};
