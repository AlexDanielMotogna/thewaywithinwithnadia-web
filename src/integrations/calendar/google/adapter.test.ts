import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createGoogleCalendar } =
  await import("@/integrations/calendar/google/adapter");

interface Call {
  url: string;
  method: string;
  body: unknown;
}

function fakeFetch(responses: Response[]) {
  const calls: Call[] = [];
  const impl: typeof fetch = (input, init) => {
    calls.push({
      url:
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    });
    const next = responses.shift();
    if (!next) throw new Error("unexpected fetch");
    return Promise.resolve(next);
  };
  return { impl, calls };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

function calendarWith(responses: Response[]) {
  const fetchMock = fakeFetch(responses);
  const calendar = createGoogleCalendar({
    calendarId: "primary",
    getAccessToken: () => Promise.resolve({ ok: true, value: "token" }),
    fetch: fetchMock.impl,
  });
  return { calendar, calls: fetchMock.calls };
}

const eventInput = {
  eventKey: "abc123",
  timezone: "Europe/Vienna",
  title: "Meditation - Ana",
  description: "",
  start: new Date("2026-11-04T09:00:00Z"),
  end: new Date("2026-11-04T10:00:00Z"),
  attendeeEmail: "ana@example.com",
  withMeet: true,
};

describe("Google calendar adapter", () => {
  it("creates an event with a fixed id, a Meet request and no Google emails", async () => {
    const { calendar, calls } = calendarWith([
      json(200, { id: "abc123", hangoutLink: "https://meet.google.com/xyz" }),
    ]);
    const result = await calendar.createEvent(eventInput);

    expect(result).toEqual({
      ok: true,
      value: { eventId: "abc123", meetUrl: "https://meet.google.com/xyz" },
    });
    expect(calls[0]?.url).toContain("conferenceDataVersion=1");
    expect(calls[0]?.url).toContain("sendUpdates=none");
    expect(calls[0]?.body).toMatchObject({
      id: "abc123",
      conferenceData: { createRequest: { requestId: "abc123" } },
      attendees: [{ email: "ana@example.com" }],
    });
  });

  it("does not request a Meet for in-person sessions", async () => {
    const { calendar, calls } = calendarWith([json(200, { id: "abc123" })]);
    const result = await calendar.createEvent({
      ...eventInput,
      withMeet: false,
    });
    expect(result).toEqual({
      ok: true,
      value: { eventId: "abc123", meetUrl: null },
    });
    expect(calls[0]?.body).not.toHaveProperty("conferenceData");
  });

  it("reuses the existing event when a retry hits 409 (no duplicate)", async () => {
    const { calendar, calls } = calendarWith([
      json(409, { error: { code: 409 } }),
      json(200, {
        id: "abc123",
        conferenceData: {
          entryPoints: [
            { entryPointType: "video", uri: "https://meet.google.com/abc" },
          ],
        },
      }),
    ]);
    const result = await calendar.createEvent(eventInput);
    expect(result).toEqual({
      ok: true,
      value: { eventId: "abc123", meetUrl: "https://meet.google.com/abc" },
    });
    expect(calls[1]).toMatchObject({ method: "GET" });
    expect(calls[1]?.url).toContain("/events/abc123");
  });

  it("returns null meetUrl while the Meet is still pending", async () => {
    const { calendar } = calendarWith([json(200, { id: "abc123" })]);
    const result = await calendar.createEvent(eventInput);
    expect(result).toEqual({
      ok: true,
      value: { eventId: "abc123", meetUrl: null },
    });
  });

  it("maps HTTP errors and malformed responses to calendar_unavailable", async () => {
    const http = await calendarWith([json(500, {})]).calendar.createEvent(
      eventInput,
    );
    const malformed = await calendarWith([
      json(200, { nope: 1 }),
    ]).calendar.createEvent(eventInput);
    expect(http).toMatchObject({
      ok: false,
      error: { kind: "calendar_unavailable" },
    });
    expect(malformed).toMatchObject({
      ok: false,
      error: { kind: "calendar_unavailable" },
    });
  });

  it("treats 404/410 on delete as already deleted", async () => {
    for (const status of [204, 404, 410]) {
      const { calendar } = calendarWith([new Response(null, { status })]);
      expect(await calendar.deleteEvent("abc123")).toEqual({
        ok: true,
        value: undefined,
      });
    }
    const { calendar } = calendarWith([json(500, {})]);
    expect((await calendar.deleteEvent("abc123")).ok).toBe(false);
  });

  it("parses free/busy blocks and fails on per-calendar errors", async () => {
    const range = {
      start: new Date("2026-11-04T00:00:00Z"),
      end: new Date("2026-11-05T00:00:00Z"),
    };
    const ok = calendarWith([
      json(200, {
        calendars: {
          primary: {
            busy: [
              {
                start: "2026-11-04T10:00:00+01:00",
                end: "2026-11-04T11:00:00+01:00",
              },
            ],
          },
        },
      }),
    ]);
    expect(await ok.calendar.getBusy(range)).toEqual({
      ok: true,
      value: [
        {
          start: new Date("2026-11-04T09:00:00Z"),
          end: new Date("2026-11-04T10:00:00Z"),
        },
      ],
    });

    const failed = calendarWith([
      json(200, {
        calendars: { primary: { busy: [], errors: [{ reason: "notFound" }] } },
      }),
    ]);
    expect((await failed.calendar.getBusy(range)).ok).toBe(false);
  });

  it("propagates a missing access token without calling Google", async () => {
    const fetchMock = fakeFetch([]);
    const calendar = createGoogleCalendar({
      calendarId: "primary",
      getAccessToken: () =>
        Promise.resolve({
          ok: false,
          error: { kind: "calendar_unavailable" },
        }),
      fetch: fetchMock.impl,
    });
    expect((await calendar.deleteEvent("x")).ok).toBe(false);
    expect(fetchMock.calls).toHaveLength(0);
  });
});
