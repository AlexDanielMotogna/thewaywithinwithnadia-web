import type { CollectionAfterChangeHook } from "payload";
import { isActiveBooking } from "@/modules/booking/pure";
import type { Booking } from "@/payload-types";

/**
 * When a booking stops being active (cancelled or rescheduled), queue the
 * removal of its calendar event, and on a cancellation the emails. Runs
 * for every path, including a status change made directly in the admin.
 * Queued with `req`, so the jobs are only created if the status write
 * itself commits. A reschedule sends no cancellation email: the client
 * gets the confirmation of the new booking instead.
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
  if (!deactivated) return doc;

  if (doc.calendarEventId) {
    await req.payload.jobs.queue({
      task: "removeBookingCalendarEvent",
      input: { bookingId: doc.id },
      req,
    });
  }
  if (doc.status === "cancelled") {
    await req.payload.jobs.queue({
      task: "notifyBookingCancelled",
      // Nadia cancelling in the admin does not need an email about it.
      input: { bookingId: doc.id, notifyOwner: !req.user },
      req,
    });
  }
  return doc;
};
