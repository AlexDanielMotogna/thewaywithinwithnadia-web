import type { Result } from "@/lib/result";

export interface CalendarEventInput {
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
