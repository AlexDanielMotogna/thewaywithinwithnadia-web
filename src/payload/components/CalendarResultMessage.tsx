"use client";

import { useSearchParams } from "next/navigation";

// Result of the OAuth round trip (?calendar=..., see CalendarConnection.ts).
// Read on the client: Payload does not pass searchParams to field components.
const RESULT_MESSAGES: Partial<Record<string, string>> = {
  connected: "Google Calendar connected.",
  disconnected: "Google Calendar disconnected.",
  not_configured:
    "Google sign-in is not configured on the server yet (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
  denied: "Google access was not granted. Nothing was changed.",
  invalid_state:
    "The connection attempt expired or did not match. Please try again.",
  google_error: "Google did not complete the connection. Please try again.",
  missing_scopes:
    "Calendar access was not granted. On the Google screen, keep both calendar permissions ticked and try again.",
};

export function CalendarResultMessage() {
  const result = useSearchParams().get("calendar");
  const message = result ? RESULT_MESSAGES[result] : undefined;
  if (!message) return null;
  return (
    <p role="status" style={{ fontWeight: 600, margin: "0 0 0.5rem" }}>
      {message}
    </p>
  );
}
