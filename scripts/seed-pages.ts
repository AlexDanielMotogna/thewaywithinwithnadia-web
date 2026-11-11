// Run via `pnpm payload:seed-pages`. Rewrites the CMS pages (Pages + Media
// only — never Services or booking data). See seed-pages-run.ts.
//
// Top-level await, not a fire-and-forget `main()`: `payload run` exits as
// soon as the module has been imported, killing any still-pending promise.
import config from "@payload-config";
import { getPayload } from "payload";
import { runSeedPages } from "./seed-pages-run";

const payload = await getPayload({ config });
for (const line of await runSeedPages(payload)) console.log(line);
console.log("Page seed complete.");
process.exit(0);
