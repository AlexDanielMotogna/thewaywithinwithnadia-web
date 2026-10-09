// Run via `pnpm payload:attach-media`. See attach-media-run.ts for the
// actual logic/content.
import config from "@payload-config";
import { getPayload } from "payload";
import { runAttachMedia } from "./attach-media-run";

async function main() {
  const payload = await getPayload({ config });
  const log = await runAttachMedia(payload);
  for (const line of log) console.log(line);
  console.log("Done.");
  process.exit(0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
