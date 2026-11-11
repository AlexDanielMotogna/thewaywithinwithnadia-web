import "server-only";
import config from "@payload-config";
import { getPayload } from "payload";

export async function markCalendarSynced(
  id: number,
  input: { calendarEventId: string; meetingUrl: string | null },
): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "bookings",
    id,
    data: {
      calendarEventId: input.calendarEventId,
      meetingUrl: input.meetingUrl,
    },
  });
}

export async function markConfirmationSent(
  id: number,
  at: Date,
): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "bookings",
    id,
    data: { confirmationSentAt: at.toISOString() },
  });
}

export async function markOwnerNotified(id: number, at: Date): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "bookings",
    id,
    data: { ownerNotifiedAt: at.toISOString() },
  });
}

export async function markCancellationSent(
  id: number,
  at: Date,
): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "bookings",
    id,
    data: { cancellationSentAt: at.toISOString() },
  });
}

export async function clearCalendarEvent(id: number): Promise<void> {
  const payload = await getPayload({ config });
  await payload.update({
    collection: "bookings",
    id,
    data: { calendarEventId: null },
  });
}
