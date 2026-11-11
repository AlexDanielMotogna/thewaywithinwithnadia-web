// Run via `pnpm payload:seed`. Safe to re-run: creates missing services,
// rewrites the CMS pages (seed-pages-run.ts).
// See seed-data.ts for the actual content and sourcing notes.
import config from "@payload-config";
import { getPayload } from "payload";
import { runSeed } from "./seed-data";

// Top-level await: `payload run` exits once the module is imported, so a
// fire-and-forget `main()` would be killed before it finishes.
const payload = await getPayload({ config });
for (const line of await runSeed(payload)) console.log(line);
console.log("Seed complete.");
process.exit(0);
