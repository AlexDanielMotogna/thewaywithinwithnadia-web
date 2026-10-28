import "server-only";
import { z } from "zod";
import type { Result } from "@/lib/result";
import type {
  CalendarError,
  CalendarProvider,
} from "@/integrations/calendar/port";

const API = "https://www.googleapis.com/calendar/v3";

const eventSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  hangoutLink: z.string().optional(),
  conferenceData: z
    .object({
      entryPoints: z
        .array(z.object({ entryPointType: z.string(), uri: z.string() }))
        .optional(),
    })
    .optional(),
});

const freeBusySchema = z.object({
  calendars: z.record(
    z.string(),
    z.object({
      busy: z
        .array(
          z.object({
            start: z.iso.datetime({ offset: true }),
            end: z.iso.datetime({ offset: true }),
          }),
        )
        .default([]),
      errors: z.array(z.object({ reason: z.string() })).optional(),
    }),
  ),
});

type GoogleEvent = z.infer<typeof eventSchema>;

export interface GoogleCalendarOptions {
  calendarId: string;
  getAccessToken: () => Promise<Result<string, CalendarError>>;
  fetch?: typeof fetch;
}

function unavailable(cause: unknown): { ok: false; error: CalendarError } {
  return { ok: false, error: { kind: "calendar_unavailable", cause } };
}

// The video link is in `hangoutLink`; `entryPoints` is the documented
// fallback. Absent while Google still provisions the Meet ("pending").
export function meetUrlOf(event: GoogleEvent): string | null {
  if (event.hangoutLink) return event.hangoutLink;
  const video = event.conferenceData?.entryPoints?.find(
    (entry) => entry.entryPointType === "video",
  );
  return video?.uri ?? null;
}

export function createGoogleCalendar(
  options: GoogleCalendarOptions,
): CalendarProvider {
  const doFetch = options.fetch ?? fetch;
  const calendarPath = `${API}/calendars/${encodeURIComponent(options.calendarId)}`;

  async function call(
    url: string,
    init: { method: string; body?: unknown },
  ): Promise<Result<Response, CalendarError>> {
    const token = await options.getAccessToken();
    if (!token.ok) return token;
    try {
      const response = await doFetch(url, {
        method: init.method,
        headers: {
          Authorization: `Bearer ${token.value}`,
          ...(init.body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
        },
        ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
      });
      return { ok: true, value: response };
    } catch (error) {
      return unavailable(error);
    }
  }

  async function parseEvent(
    response: Response,
  ): Promise<Result<GoogleEvent, CalendarError>> {
    const parsed = eventSchema.safeParse(await response.json());
    return parsed.success
      ? { ok: true, value: parsed.data }
      : unavailable(parsed.error);
  }

  return {
    async getBusy(range) {
      const result = await call(`${API}/freeBusy`, {
        method: "POST",
        body: {
          timeMin: range.start.toISOString(),
          timeMax: range.end.toISOString(),
          items: [{ id: options.calendarId }],
        },
      });
      if (!result.ok) return result;
      if (!result.value.ok)
        return unavailable(`freeBusy HTTP ${String(result.value.status)}`);

      const parsed = freeBusySchema.safeParse(await result.value.json());
      if (!parsed.success) return unavailable(parsed.error);
      const calendar = parsed.data.calendars[options.calendarId];
      if (!calendar || (calendar.errors?.length ?? 0) > 0) {
        return unavailable(
          calendar?.errors ?? "calendar missing from freeBusy",
        );
      }
      return {
        ok: true,
        value: calendar.busy.map((block) => ({
          start: new Date(block.start),
          end: new Date(block.end),
        })),
      };
    },

    async createEvent(input) {
      const result = await call(
        `${calendarPath}/events?conferenceDataVersion=1&sendUpdates=none`,
        {
          method: "POST",
          body: {
            id: input.eventKey,
            summary: input.title,
            description: input.description,
            start: {
              dateTime: input.start.toISOString(),
              timeZone: input.timezone,
            },
            end: {
              dateTime: input.end.toISOString(),
              timeZone: input.timezone,
            },
            attendees: [{ email: input.attendeeEmail }],
            ...(input.withMeet
              ? {
                  conferenceData: {
                    createRequest: {
                      requestId: input.eventKey,
                      conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                  },
                }
              : {}),
          },
        },
      );
      if (!result.ok) return result;

      let response = result.value;
      // 409: an event with this id already exists, i.e. an earlier attempt
      // succeeded but its response was lost. Use that event.
      if (response.status === 409) {
        const existing = await call(
          `${calendarPath}/events/${input.eventKey}`,
          { method: "GET" },
        );
        if (!existing.ok) return existing;
        response = existing.value;
      }
      if (!response.ok)
        return unavailable(`events.insert HTTP ${String(response.status)}`);

      const event = await parseEvent(response);
      if (!event.ok) return event;
      if (event.value.status === "cancelled") {
        return unavailable(`event ${input.eventKey} exists but was deleted`);
      }
      return {
        ok: true,
        value: { eventId: event.value.id, meetUrl: meetUrlOf(event.value) },
      };
    },

    async deleteEvent(eventId) {
      const result = await call(
        `${calendarPath}/events/${encodeURIComponent(eventId)}?sendUpdates=none`,
        { method: "DELETE" },
      );
      if (!result.ok) return result;
      // 404/410: already gone, which is the state we want.
      if (
        result.value.ok ||
        result.value.status === 404 ||
        result.value.status === 410
      ) {
        return { ok: true, value: undefined };
      }
      return unavailable(`events.delete HTTP ${String(result.value.status)}`);
    },
  };
}
