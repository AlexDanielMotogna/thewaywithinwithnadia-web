import {
  isActiveBooking,
  removesCalendarEvent,
  type BookingStatus,
} from "@/modules/booking/domain/state-machine";

export type BookingChange =
  | { kind: "created" }
  | { kind: "updated"; from: BookingStatus }
  | { kind: "deleted" };

export type BookingJob =
  | { task: "processBookingSideEffects"; notifyOwner: boolean }
  | { task: "removeBookingCalendarEvent" }
  | { task: "notifyBookingCancelled"; notifyOwner: boolean };

/**
 * Which side-effect jobs (ENGINEERING.md §5.5) a write to a booking needs,
 * whatever made it: the website's use cases or Nadia in the admin. The
 * Bookings collection hooks queue exactly these, so the admin cannot skip
 * the calendar sync. `byOwner`: the change was made by a logged-in admin,
 * who does not need an email about her own action.
 */
export function jobsForBookingChange(input: {
  change: BookingChange;
  status: BookingStatus;
  hasCalendarEvent: boolean;
  byOwner: boolean;
}): BookingJob[] {
  const { change, status, hasCalendarEvent, byOwner } = input;
  switch (change.kind) {
    case "created":
      return [{ task: "processBookingSideEffects", notifyOwner: !byOwner }];
    case "deleted":
      // No email: deleting is admin housekeeping. Cancelling is the action
      // that tells the client.
      return hasCalendarEvent ? [{ task: "removeBookingCalendarEvent" }] : [];
    case "updated": {
      const jobs: BookingJob[] = [];
      const eventNoLongerWanted =
        !removesCalendarEvent(change.from) && removesCalendarEvent(status);
      if (eventNoLongerWanted && hasCalendarEvent) {
        jobs.push({ task: "removeBookingCalendarEvent" });
      }
      // A reschedule sends no cancellation email: the client gets the
      // confirmation of the new booking instead.
      if (isActiveBooking(change.from) && status === "cancelled") {
        jobs.push({ task: "notifyBookingCancelled", notifyOwner: !byOwner });
      }
      return jobs;
    }
    default: {
      const unhandled: never = change;
      return unhandled;
    }
  }
}
