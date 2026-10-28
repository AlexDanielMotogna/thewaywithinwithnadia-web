import type { Result } from "@/lib/result";

export interface CalendarEventInput {
  /**
   * Stable per booking. Used as the event id, so a retried create after a
   * lost response finds the existing event instead of adding a duplicate.
   * Lowercase hex only (valid Google event id characters).
   */
  eventKey: string;
  /** IANA zone the event is shown in on Nadia's calendar. */
  timezone: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendeeEmail: string;
  /** Request a Google Meet link via `conferenceData` (ENGINEERING.md §6). */
  withMeet: boolean;
}

export type CalendarError = { kind: "calendar_unavailable"; cause?: unknown };

export interface CalendarProvider {
  getBusy(range: {
    start: Date;
    end: Date;
  }): Promise<Result<{ start: Date; end: Date }[], CalendarError>>;
  createEvent(
    input: CalendarEventInput,
  ): Promise<
    Result<{ eventId: string; meetUrl: string | null }, CalendarError>
  >;
  deleteEvent(eventId: string): Promise<Result<undefined, CalendarError>>;
}
