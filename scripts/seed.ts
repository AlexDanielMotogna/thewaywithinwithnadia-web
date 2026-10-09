// Run via `pnpm payload:seed`. Idempotent: upserts by slug, safe to re-run.
// See seed-data.ts for the actual content and sourcing notes.
import config from "@payload-config";
import { getPayload } from "payload";
import { runSeed } from "./seed-data";

async function main() {
  const payload = await getPayload({ config });
  const log = await runSeed(payload);
  for (const line of log) console.log(line);
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
