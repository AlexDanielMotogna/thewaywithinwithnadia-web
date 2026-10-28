import "server-only";
import type { CalendarProvider } from "@/integrations/calendar/port";

/**
 * Fake adapter: used while no Google account is connected (PENDING.md #5).
 * Free/busy is reported empty (the exclusion constraint is still the real
 * guarantee against double-booking, ENGINEERING.md §5.3; this only skips
 * the extra check against Nadia's own calendar events). `createEvent`
 * returns an id derived from the event key but **no meeting link**: a
 * fabricated link would reach the client in the confirmation email, which
 * already says the link follows separately when there is none.
 */
export const fakeCalendar: CalendarProvider = {
  getBusy() {
    return Promise.resolve({ ok: true, value: [] });
  },
  createEvent(input) {
    const eventId = `fake-${input.eventKey}`;
    console.log("[calendar:fake] createEvent", { eventId, title: input.title });
    return Promise.resolve({ ok: true, value: { eventId, meetUrl: null } });
  },
  deleteEvent(eventId) {
    console.log("[calendar:fake] deleteEvent", eventId);
    return Promise.resolve({ ok: true, value: undefined });
  },
};

/**
 * Google was connected but the connection broke (token revoked or
 * expired). Every call fails, so side-effect jobs retry and end up visibly
 * failed instead of silently writing fake events, until Nadia reconnects.
 */
export const disconnectedCalendar: CalendarProvider = {
  getBusy() {
    return Promise.resolve({
      ok: false,
      error: { kind: "calendar_unavailable", cause: "needs reconnect" },
    });
  },
  createEvent() {
    return Promise.resolve({
      ok: false,
      error: { kind: "calendar_unavailable", cause: "needs reconnect" },
    });
  },
  deleteEvent() {
    return Promise.resolve({
      ok: false,
      error: { kind: "calendar_unavailable", cause: "needs reconnect" },
    });
  },
};
