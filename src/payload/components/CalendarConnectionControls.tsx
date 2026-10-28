import type { ServerProps } from "payload";
import { CalendarResultMessage } from "@/payload/components/CalendarResultMessage";

const BASE = "/api/globals/calendar-connection";
const PAGE = "/admin/globals/calendar-connection";

const box = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: "4px",
  padding: "1rem 1.25rem",
  marginBottom: "1.5rem",
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem 1.5rem",
  alignItems: "center",
  justifyContent: "space-between",
} as const;

async function loadStatus(payload: ServerProps["payload"]) {
  const connection = await payload.findGlobal({ slug: "calendar-connection" });
  return {
    status: connection.status,
    email: connection.connectedEmail ?? null,
  };
}

function describe(status: string, email: string | null): string {
  if (status === "connected") {
    return `Connected${email ? ` as ${email}` : ""}. New bookings are added to this calendar.`;
  }
  if (status === "needs_reconnect") {
    return "The connection to Google stopped working (access was revoked or expired). Bookings still work, but no calendar events or Meet links are created until you reconnect.";
  }
  return "Not connected. Bookings work, but they are not added to Google Calendar and online sessions get no Meet link.";
}

/** Status + Connect / Disconnect, on the Google Calendar settings page. */
export async function CalendarConnectionControls({ payload }: ServerProps) {
  const { status, email } = await loadStatus(payload);

  return (
    <div style={box}>
      <div>
        <CalendarResultMessage />
        <p style={{ margin: 0 }}>{describe(status, email)}</p>
      </div>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <a
          className="btn btn--style-primary btn--size-small"
          href={`${BASE}/oauth/start`}
        >
          {status === "not_connected" ? "Connect Google Calendar" : "Reconnect"}
        </a>
        {status === "not_connected" ? null : (
          <form method="post" action={`${BASE}/disconnect`}>
            <button
              type="submit"
              className="btn btn--style-secondary btn--size-small"
            >
              Disconnect
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/** Dashboard notice, only while the calendar is not working. */
export async function CalendarConnectionNotice({ payload }: ServerProps) {
  const { status, email } = await loadStatus(payload);
  if (status === "connected") return null;
  return (
    <div style={box} role="status">
      <p style={{ margin: 0 }}>
        <strong>Google Calendar: </strong>
        {describe(status, email)}
      </p>
      <a className="btn btn--style-primary btn--size-small" href={PAGE}>
        Open calendar settings
      </a>
    </div>
  );
}
