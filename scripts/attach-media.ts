// Run via `pnpm payload:attach-media`. See attach-media-run.ts for the
// actual logic/content.
import config from "@payload-config";
import { getPayload } from "payload";
import { runAttachMedia } from "./attach-media-run";

// Top-level await: `payload run` exits once the module is imported, so a
// fire-and-forget `main()` would be killed before it finishes.
const payload = await getPayload({ config });
for (const line of await runAttachMedia(payload)) console.log(line);
console.log("Done.");
process.exit(0);
