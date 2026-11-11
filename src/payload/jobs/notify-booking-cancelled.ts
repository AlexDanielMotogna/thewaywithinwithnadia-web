import type { TaskConfig } from "payload";
import { sideEffectRetries } from "@/payload/jobs/retry-policy";

export const notifyBookingCancelledTask: TaskConfig<{
  input: { bookingId: number; notifyOwner: boolean };
  output: object;
}> = {
  slug: "notifyBookingCancelled",
  inputSchema: [
    { name: "bookingId", type: "number", required: true },
    { name: "notifyOwner", type: "checkbox", required: true },
  ],
  retries: sideEffectRetries,
  handler: async ({ input }) => {
    // Lazy import for the same reason as processBookingSideEffects: keeps
    // `server-only` code out of payload.config.ts at load time (BUGS.md).
    const { notifyBookingCancelled } = await import("@/modules/booking");
    await notifyBookingCancelled(input);
    return { output: {} };
  },
};
