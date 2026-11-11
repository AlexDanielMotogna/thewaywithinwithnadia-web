// Runs once when the Next.js server starts (Next "instrumentation" hook).
// The Node-only work lives in its own file, imported behind the runtime
// check, so it never ends up in a non-Node bundle.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPayloadCron } = await import("./payload-cron");
    await startPayloadCron();
  }
}
