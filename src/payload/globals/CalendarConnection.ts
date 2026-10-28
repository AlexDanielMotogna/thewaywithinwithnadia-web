import type { GlobalConfig, PayloadRequest } from "payload";

const ADMIN_PAGE = "/admin/globals/calendar-connection";

function redirect(location: string, setCookie?: string): Response {
  const headers = new Headers({ Location: location });
  if (setCookie) headers.append("Set-Cookie", setCookie);
  return new Response(null, { status: 302, headers });
}

function cookieValue(req: PayloadRequest, name: string): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

// Google Calendar connection (ENGINEERING.md §6, Phase 6). Nadia connects
// her account once from the admin; the refresh token is stored encrypted and
// is never readable through the API or the admin UI. The OAuth endpoints
// below run the flow; their logic lives in modules/calendar, imported
// lazily so payload.config.ts stays loadable by the Payload CLI (BUGS.md).
export const CalendarConnection: GlobalConfig = {
  slug: "calendar-connection",
  label: "Google Calendar",
  admin: {
    description:
      "Connect the Google account whose calendar holds Nadia's sessions. " +
      "Bookings are added to it (with a Google Meet link for online " +
      "sessions), and its busy times are kept free on the booking page.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "connection",
      type: "ui",
      admin: {
        components: {
          Field:
            "@/payload/components/CalendarConnectionControls#CalendarConnectionControls",
        },
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "not_connected",
      options: [
        { label: "Not connected", value: "not_connected" },
        { label: "Connected", value: "connected" },
        { label: "Needs to be reconnected", value: "needs_reconnect" },
      ],
      admin: { readOnly: true },
    },
    { name: "connectedEmail", type: "email", admin: { readOnly: true } },
    { name: "connectedAt", type: "date", admin: { readOnly: true } },
    {
      name: "calendarId",
      type: "text",
      required: true,
      defaultValue: "primary",
      admin: {
        description:
          '"primary" is the main calendar of the connected account. Use ' +
          "another calendar's ID (Google Calendar → Settings → Integrate " +
          "calendar) to keep sessions in a separate calendar.",
      },
    },
    {
      // Sealed with lib/secret-box. Only the calendar module reads it, via
      // the Local API; no user can read or write it directly.
      name: "refreshTokenSealed",
      type: "text",
      access: {
        read: () => false,
        create: () => false,
        update: () => false,
      },
      admin: { hidden: true },
    },
  ],
  endpoints: [
    {
      path: "/oauth/start",
      method: "get",
      handler: async (req) => {
        if (!req.user) return new Response("Unauthorized", { status: 401 });
        const { startGoogleConnection } = await import("@/modules/calendar");
        const result = startGoogleConnection({ userId: String(req.user.id) });
        if (!result.ok)
          return redirect(`${ADMIN_PAGE}?calendar=not_configured`);
        return redirect(result.value.authUrl, result.value.setCookie);
      },
    },
    {
      path: "/oauth/callback",
      method: "get",
      handler: async (req) => {
        if (!req.user) return new Response("Unauthorized", { status: 401 });
        const { completeGoogleConnection, OAUTH_STATE_COOKIE } =
          await import("@/modules/calendar");
        const url = new URL(req.url ?? "", "http://localhost");
        const result = await completeGoogleConnection({
          userId: String(req.user.id),
          code: url.searchParams.get("code"),
          state: url.searchParams.get("state"),
          stateCookie: cookieValue(req, OAUTH_STATE_COOKIE),
          googleError: url.searchParams.get("error"),
        });
        return redirect(
          `${ADMIN_PAGE}?calendar=${result.ok ? "connected" : result.error.kind}`,
          result.clearCookie,
        );
      },
    },
    {
      path: "/disconnect",
      method: "post",
      handler: async (req) => {
        if (!req.user) return new Response("Unauthorized", { status: 401 });
        const { disconnectGoogleCalendar } = await import("@/modules/calendar");
        await disconnectGoogleCalendar();
        return redirect(`${ADMIN_PAGE}?calendar=disconnected`);
      },
    },
  ],
};
