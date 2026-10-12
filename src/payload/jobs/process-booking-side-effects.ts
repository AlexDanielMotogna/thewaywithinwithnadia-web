import type { TaskConfig } from "payload";

export const processBookingSideEffectsTask: TaskConfig<{
  input: { bookingId: number };
  output: object;
}> = {
  slug: "processBookingSideEffects",
  inputSchema: [{ name: "bookingId", type: "number", required: true }],
  handler: async ({ input }) => {
    // Lazy import, deliberately: it keeps this file (and payload.config.ts,
    // which registers it) free of any `server-only`-guarded dependency at
    // module-load time. The Payload CLI (migrate/generate-types) loads
    // payload.config.ts via plain Node/tsx, which can't satisfy
    // `server-only`'s "react-server" export condition and throws on eager
    // import (see BUGS.md) — those CLI commands never run a job, so this
    // import never actually executes under them.
    const { processBookingSideEffects } = await import("@/modules/booking");
    await processBookingSideEffects(input.bookingId);
    return { output: {} };
  },
};
