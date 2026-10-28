import "server-only";
import { z } from "zod";
import type { Result } from "@/lib/result";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

// Least privilege: create/delete events and read free/busy only; no read
// access to the content of Nadia's other events. `openid email` only to
// show which account is connected.
export const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

// Google's consent screen lets the user untick individual scopes, so a
// successful exchange can still lack calendar access.
export function hasCalendarScopes(granted: readonly string[]): boolean {
  return GOOGLE_CALENDAR_SCOPES.filter((scope) =>
    scope.startsWith("https://"),
  ).every((scope) => granted.includes(scope));
}

export interface GoogleOAuthClient {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export type OAuthError =
  { kind: "revoked" } | { kind: "unavailable"; cause?: unknown };

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
});

const idTokenClaimsSchema = z.object({ email: z.email().optional() });

export function buildAuthUrl(client: GoogleOAuthClient, state: string): string {
  const params = new URLSearchParams({
    client_id: client.clientId,
    redirect_uri: client.redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
    // offline + consent: always return a refresh token, also on reconnect.
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// The id_token comes straight from Google's token endpoint over TLS, so its
// claims can be read without verifying the signature (Google's OpenID
// Connect docs). Only used to label the connection in the admin.
function emailFromIdToken(idToken: string | undefined): string | null {
  const payload = idToken?.split(".")[1];
  if (!payload) return null;
  try {
    const claims = idTokenClaimsSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    return claims.success ? (claims.data.email ?? null) : null;
  } catch {
    return null;
  }
}

async function postToken(
  body: Record<string, string>,
  doFetch: typeof fetch,
): Promise<Result<z.infer<typeof tokenResponseSchema>, OAuthError>> {
  let response: Response;
  try {
    response = await doFetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });
  } catch (error) {
    return { ok: false, error: { kind: "unavailable", cause: error } };
  }
  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    // invalid_grant: the refresh token was revoked or expired; only a new
    // consent fixes it.
    const isRevoked = z
      .object({ error: z.literal("invalid_grant") })
      .safeParse(json).success;
    return {
      ok: false,
      error: isRevoked
        ? { kind: "revoked" }
        : {
            kind: "unavailable",
            cause: `token HTTP ${String(response.status)}`,
          },
    };
  }
  const parsed = tokenResponseSchema.safeParse(json);
  return parsed.success
    ? { ok: true, value: parsed.data }
    : { ok: false, error: { kind: "unavailable", cause: parsed.error } };
}

export async function exchangeCode(
  client: GoogleOAuthClient,
  code: string,
  doFetch: typeof fetch = fetch,
): Promise<
  Result<
    { refreshToken: string; email: string | null; grantedScopes: string[] },
    OAuthError
  >
> {
  const result = await postToken(
    {
      code,
      client_id: client.clientId,
      client_secret: client.clientSecret,
      redirect_uri: client.redirectUri,
      grant_type: "authorization_code",
    },
    doFetch,
  );
  if (!result.ok) return result;
  if (!result.value.refresh_token) {
    return {
      ok: false,
      error: { kind: "unavailable", cause: "no refresh_token in response" },
    };
  }
  return {
    ok: true,
    value: {
      refreshToken: result.value.refresh_token,
      email: emailFromIdToken(result.value.id_token),
      grantedScopes: result.value.scope?.split(" ") ?? [],
    },
  };
}

export async function refreshAccessToken(
  client: GoogleOAuthClient,
  refreshToken: string,
  doFetch: typeof fetch = fetch,
): Promise<Result<{ accessToken: string; expiresInSec: number }, OAuthError>> {
  const result = await postToken(
    {
      refresh_token: refreshToken,
      client_id: client.clientId,
      client_secret: client.clientSecret,
      grant_type: "refresh_token",
    },
    doFetch,
  );
  if (!result.ok) return result;
  return {
    ok: true,
    value: {
      accessToken: result.value.access_token,
      expiresInSec: result.value.expires_in,
    },
  };
}

export async function revokeToken(
  token: string,
  doFetch: typeof fetch = fetch,
): Promise<void> {
  // Best effort: disconnecting locally must work even if Google is down.
  await doFetch(
    `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`,
    { method: "POST" },
  ).catch(() => undefined);
}
