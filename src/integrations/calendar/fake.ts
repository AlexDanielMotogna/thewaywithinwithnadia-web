import "server-only";
import type { CalendarProvider } from "@/integrations/calendar/port";

/**
 * Fake adapter: no real Google account connected yet (PENDING.md #5). Google
 * free/busy is reported empty (the exclusion constraint is still the real
 * guarantee against double-booking, ENGINEERING.md §5.3 — this only skips
 * the *extra* check against Nadia's own manually-created calendar events).
 * `createEvent` fabricates a stable-looking but clearly-fake id/url so the
 * booking flow and jobs can be exercised end-to-end before real credentials
 * land.
 */
export const fakeCalendar: CalendarProvider = {
  getBusy() {
    return Promise.resolve({ ok: true, value: [] });
  },
  createEvent(input) {
    const eventId = `fake-event-${String(Date.now())}`;
    console.log("[calendar:fake] createEvent", { eventId, ...input });
    return Promise.resolve({
      ok: true,
      value: {
        eventId,
        meetUrl: input.withMeet
          ? `https://meet.example.invalid/${eventId}`
          : null,
      },
    });
  },
  deleteEvent(eventId) {
    console.log("[calendar:fake] deleteEvent", eventId);
    return Promise.resolve({ ok: true, value: undefined });
  },
};
