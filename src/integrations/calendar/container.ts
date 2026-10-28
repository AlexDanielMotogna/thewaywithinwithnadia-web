import "server-only";
import { env } from "@/lib/env";
import type { Result } from "@/lib/result";
import {
  disconnectedCalendar,
  fakeCalendar,
} from "@/integrations/calendar/fake";
import { createGoogleCalendar } from "@/integrations/calendar/google/adapter";
import type { GoogleOAuthClient } from "@/integrations/calendar/google/oauth";
import type {
  CalendarError,
  CalendarProvider,
} from "@/integrations/calendar/port";

// Payload serves the global's custom endpoints under this path; the same
// URL must be registered as an authorized redirect URI in Google Cloud.
export const GOOGLE_OAUTH_CALLBACK_PATH =
  "/api/globals/calendar-connection/oauth/callback";

/** null when the OAuth client credentials are not configured (PENDING.md #5). */
export function getGoogleOAuthClient(): GoogleOAuthClient | null {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: new URL(
      GOOGLE_OAUTH_CALLBACK_PATH,
      env.NEXT_PUBLIC_SITE_URL,
    ).toString(),
  };
}

export type CalendarConnectionState =
  | { kind: "not_connected" }
  | { kind: "needs_reconnect" }
  | {
      kind: "connected";
      calendarId: string;
      getAccessToken: () => Promise<Result<string, CalendarError>>;
    };

/**
 * The one place the calendar adapter is chosen (ENGINEERING.md §6). The
 * caller (modules/calendar) supplies the stored connection state, so this
 * file never touches the database.
 */
export function getCalendar(state: CalendarConnectionState): CalendarProvider {
  switch (state.kind) {
    case "not_connected":
      return fakeCalendar;
    case "needs_reconnect":
      return disconnectedCalendar;
    case "connected":
      return createGoogleCalendar({
        calendarId: state.calendarId,
        getAccessToken: state.getAccessToken,
      });
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}
