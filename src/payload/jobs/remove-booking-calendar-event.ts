import type { TaskConfig } from "payload";
import { sideEffectRetries } from "@/payload/jobs/retry-policy";

export const removeBookingCalendarEventTask: TaskConfig<{
  input: { bookingId: number };
  output: object;
}> = {
  slug: "removeBookingCalendarEvent",
  inputSchema: [{ name: "bookingId", type: "number", required: true }],
  retries: sideEffectRetries,
  handler: async ({ input }) => {
    // Lazy import for the same reason as processBookingSideEffects: keeps
    // `server-only` code out of payload.config.ts at load time (BUGS.md).
    const { removeBookingCalendarEvent } = await import("@/modules/booking");
    await removeBookingCalendarEvent(input.bookingId);
    return { output: {} };
  },
};
