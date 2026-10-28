import "server-only";
import {
  getCalendar,
  getGoogleOAuthClient,
} from "@/integrations/calendar/container";
import { refreshAccessToken } from "@/integrations/calendar/google/oauth";
import type {
  CalendarError,
  CalendarProvider,
} from "@/integrations/calendar/port";
import { env } from "@/lib/env";
import type { Result } from "@/lib/result";
import { openSecret } from "@/lib/secret-box";
import {
  markNeedsReconnect,
  readConnection,
} from "@/modules/calendar/infrastructure/connection-store";

export const REFRESH_TOKEN_PURPOSE = "google-calendar-refresh-token";

// Access tokens live ~1 h. One persistent Node process (Railway), so an
// in-memory cache is enough; keyed by the sealed token so a reconnect
// never reuses a token from the previous account.
let cached: { sealed: string; token: string; expiresAt: number } | null = null;
const REFRESH_MARGIN_MS = 60_000;

async function accessTokenFor(
  sealed: string,
): Promise<Result<string, CalendarError>> {
  if (
    cached?.sealed === sealed &&
    cached.expiresAt - REFRESH_MARGIN_MS > Date.now()
  ) {
    return { ok: true, value: cached.token };
  }
  const client = getGoogleOAuthClient();
  const refreshToken = openSecret(
    sealed,
    env.PAYLOAD_SECRET,
    REFRESH_TOKEN_PURPOSE,
  );
  if (!client || !refreshToken.ok) {
    return {
      ok: false,
      error: { kind: "calendar_unavailable", cause: "no usable credentials" },
    };
  }
  const refreshed = await refreshAccessToken(client, refreshToken.value);
  if (!refreshed.ok) {
    if (refreshed.error.kind === "revoked") {
      // Only a new consent fixes this; the admin shows "reconnect".
      await markNeedsReconnect();
      cached = null;
    }
    return {
      ok: false,
      error: { kind: "calendar_unavailable", cause: refreshed.error },
    };
  }
  cached = {
    sealed,
    token: refreshed.value.accessToken,
    expiresAt: Date.now() + refreshed.value.expiresInSec * 1000,
  };
  return { ok: true, value: refreshed.value.accessToken };
}

/**
 * The calendar adapter for the current connection state (ENGINEERING.md
 * §6): Google when connected, the fake adapter when Google was never
 * connected, and a failing adapter when the connection broke.
 */
export async function loadCalendar(): Promise<CalendarProvider> {
  const connection = await readConnection();
  const sealed = connection.refreshTokenSealed;
  if (connection.status === "needs_reconnect") {
    return getCalendar({ kind: "needs_reconnect" });
  }
  if (connection.status !== "connected" || !sealed) {
    return getCalendar({ kind: "not_connected" });
  }
  return getCalendar({
    kind: "connected",
    calendarId: connection.calendarId,
    getAccessToken: () => accessTokenFor(sealed),
  });
}
