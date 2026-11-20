import type { TaskConfig } from "payload";
import { sideEffectRetries } from "@/payload/jobs/retry-policy";

export const removeBookingCalendarEventTask: TaskConfig<{
  input: { bookingId: number; calendarEventId?: string | null };
  output: object;
}> = {
  slug: "removeBookingCalendarEvent",
  inputSchema: [
    { name: "bookingId", type: "number", required: true },
    // Needed once the booking is deleted from the admin; optional so jobs
    // queued before this field existed still run.
    { name: "calendarEventId", type: "text" },
  ],
  retries: sideEffectRetries,
  handler: async ({ input }) => {
    // Lazy import for the same reason as processBookingSideEffects: keeps
    // `server-only` code out of payload.config.ts at load time (BUGS.md).
    const { removeBookingCalendarEvent } = await import("@/modules/booking");
    await removeBookingCalendarEvent({
      bookingId: input.bookingId,
      calendarEventId: input.calendarEventId ?? null,
    });
    return { output: {} };
  },
};
