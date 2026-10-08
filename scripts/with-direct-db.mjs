// Runs the Payload CLI against DIRECT_URL (session-mode connection, port
// 5432) instead of DATABASE_URL (transaction-mode pooler, port 6543).
// Migrations need session-level features the transaction pooler doesn't
// support; the app's own runtime pool keeps using DATABASE_URL as normal —
// this script only affects the child process it spawns.
import { spawnSync } from "node:child_process";

if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL is not set — see .env.example.");
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: process.env.DIRECT_URL };
const args = process.argv.slice(2);

const result = spawnSync("payload", args, {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status ?? 1);
