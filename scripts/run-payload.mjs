// Shells out to the `payload` CLI by name (via `shell: true`) instead of
// running `node_modules/.bin/payload` directly — that file is a POSIX shell
// shebang wrapper, not a Node script, so `node node_modules/.bin/payload`
// fails with a syntax error. The same reasoning applies in with-direct-db.mjs.
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

const result = spawnSync("payload", args, {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
