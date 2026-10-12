import "server-only";
import { fakeCalendar } from "@/integrations/calendar/fake";
import type { CalendarProvider } from "@/integrations/calendar/port";

/**
 * No Google OAuth credentials connected to a real calendar yet — the real
 * adapter (Phase 6, ENGINEERING.md §13 build order) doesn't exist. Always
 * the fake adapter for now; callers never change when it's added.
 */
export function getCalendar(): CalendarProvider {
  return fakeCalendar;
}
