import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";

// The Local API runs with overrideAccess, which is the only way to read or
// write `refreshTokenSealed` (its field access denies every user).

export type ConnectionStatus =
  "not_connected" | "connected" | "needs_reconnect";

export interface StoredConnection {
  status: ConnectionStatus;
  calendarId: string;
  refreshTokenSealed: string | null;
}

export async function readConnection(): Promise<StoredConnection> {
  const payload = await getPayload({ config });
  const connection = await payload.findGlobal({ slug: "calendar-connection" });
  return {
    status: connection.status,
    calendarId: connection.calendarId,
    refreshTokenSealed: connection.refreshTokenSealed ?? null,
  };
}

export async function saveConnection(input: {
  refreshTokenSealed: string;
  email: string | null;
  at: Date;
}): Promise<void> {
  const payload = await getPayload({ config });
  await payload.updateGlobal({
    slug: "calendar-connection",
    data: {
      status: "connected",
      refreshTokenSealed: input.refreshTokenSealed,
      connectedEmail: input.email,
      connectedAt: input.at.toISOString(),
    },
  });
}

export async function markNeedsReconnect(): Promise<void> {
  const payload = await getPayload({ config });
  await payload.updateGlobal({
    slug: "calendar-connection",
    data: { status: "needs_reconnect" },
  });
}

export async function clearConnection(): Promise<void> {
  const payload = await getPayload({ config });
  await payload.updateGlobal({
    slug: "calendar-connection",
    data: {
      status: "not_connected",
      refreshTokenSealed: null,
      connectedEmail: null,
      connectedAt: null,
    },
  });
}
