// Booking side effects talk to Google/email. A failure throws, and Payload
// retries with growing gaps (1, 2, 4, 8, 16 min) before marking the job
// failed in the admin. Safe because every task is idempotent (§5.5).
export const sideEffectRetries = {
  attempts: 5,
  backoff: { type: "exponential", delay: 60_000 },
} as const;
