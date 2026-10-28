import path from "node:path";
import { defineConfig } from "vitest/config";

// Integration tests (ENGINEERING.md §8): real Postgres in a Testcontainers
// container, real Payload, real migrations. Needs Docker running.
// Standalone rather than mergeConfig(base): merging concatenates `include`
// and would run the unit suite again.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 180_000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@payload-config": path.resolve(
        import.meta.dirname,
        "./src/payload.config.ts",
      ),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
