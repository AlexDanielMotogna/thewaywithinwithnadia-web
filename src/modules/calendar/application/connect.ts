import "server-only";
import { randomBytes } from "node:crypto";
import { getGoogleOAuthClient } from "@/integrations/calendar/container";
import {
  buildAuthUrl,
  exchangeCode,
  hasCalendarScopes,
  revokeToken,
} from "@/integrations/calendar/google/oauth";
import { env } from "@/lib/env";
import type { Result } from "@/lib/result";
import { openSecret, sealSecret } from "@/lib/secret-box";
import { signToken, verifyToken } from "@/lib/signed-token";
import { REFRESH_TOKEN_PURPOSE } from "@/modules/calendar/application/load-calendar";
import {
  clearConnection,
  readConnection,
  saveConnection,
} from "@/modules/calendar/infrastructure/connection-store";

export const OAUTH_STATE_COOKIE = "tww_google_oauth_state";
const STATE_PURPOSE = "google-oauth-state";
const STATE_TTL_MS = 10 * 60_000;
// Scoped to the endpoints that need it.
const COOKIE_PATH = "/api/globals/calendar-connection";

function stateCookie(value: string, maxAgeSec: number): string {
  const secure = env.NEXT_PUBLIC_SITE_URL.startsWith("https://")
    ? "; Secure"
    : "";
  return `${OAUTH_STATE_COOKIE}=${encodeURIComponent(value)}; Path=${COOKIE_PATH}; Max-Age=${String(maxAgeSec)}; HttpOnly; SameSite=Lax${secure}`;
}

/**
 * Step 1: send the logged-in admin to Google. The `state` is signed, tied
 * to this admin user, short-lived, and also set as an HttpOnly cookie, so
 * the callback only accepts the flow this browser started (CSRF).
 */
export function startGoogleConnection(input: {
  userId: string;
}): Result<{ authUrl: string; setCookie: string }, { kind: "not_configured" }> {
  const client = getGoogleOAuthClient();
  if (!client) return { ok: false, error: { kind: "not_configured" } };

  const state = signToken({
    data: `${input.userId}:${randomBytes(16).toString("hex")}`,
    secret: env.PAYLOAD_SECRET,
    purpose: STATE_PURPOSE,
    expiresAt: new Date(Date.now() + STATE_TTL_MS),
  });
  return {
    ok: true,
    value: {
      authUrl: buildAuthUrl(client, state),
      setCookie: stateCookie(state, STATE_TTL_MS / 1000),
    },
  };
}

export type ConnectError =
  | { kind: "not_configured" }
  | { kind: "denied" }
  | { kind: "invalid_state" }
  | { kind: "google_error" }
  | { kind: "missing_scopes" };

/** Step 2: Google redirects back here with a one-time code. */
export async function completeGoogleConnection(input: {
  userId: string;
  code: string | null;
  state: string | null;
  stateCookie: string | null;
  googleError: string | null;
}): Promise<Result<undefined, ConnectError> & { clearCookie: string }> {
  const clearCookie = stateCookie("", 0);
  const fail = (error: ConnectError) => ({
    ok: false as const,
    error,
    clearCookie,
  });

  const client = getGoogleOAuthClient();
  if (!client) return fail({ kind: "not_configured" });
  if (input.googleError) return fail({ kind: "denied" });

  if (!input.state || !input.code || input.state !== input.stateCookie) {
    return fail({ kind: "invalid_state" });
  }
  const verified = verifyToken({
    token: input.state,
    secret: env.PAYLOAD_SECRET,
    purpose: STATE_PURPOSE,
    now: new Date(),
  });
  if (!verified.ok || !verified.value.startsWith(`${input.userId}:`)) {
    return fail({ kind: "invalid_state" });
  }

  const exchanged = await exchangeCode(client, input.code);
  if (!exchanged.ok) return fail({ kind: "google_error" });
  if (!hasCalendarScopes(exchanged.value.grantedScopes)) {
    await revokeToken(exchanged.value.refreshToken);
    return fail({ kind: "missing_scopes" });
  }

  await saveConnection({
    refreshTokenSealed: sealSecret(
      exchanged.value.refreshToken,
      env.PAYLOAD_SECRET,
      REFRESH_TOKEN_PURPOSE,
    ),
    email: exchanged.value.email,
    at: new Date(),
  });
  return { ok: true, value: undefined, clearCookie };
}

/** Revokes the token at Google (best effort) and forgets it locally. */
export async function disconnectGoogleCalendar(): Promise<void> {
  const connection = await readConnection();
  if (connection.refreshTokenSealed) {
    const token = openSecret(
      connection.refreshTokenSealed,
      env.PAYLOAD_SECRET,
      REFRESH_TOKEN_PURPOSE,
    );
    if (token.ok) await revokeToken(token.value);
  }
  await clearConnection();
}
