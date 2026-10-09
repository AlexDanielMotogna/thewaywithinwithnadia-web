import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import boundaries from "eslint-plugin-boundaries";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Type-aware strict rules (ENGINEERING.md §4: no `any`, no floating promises).
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs", "scripts/*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      // Generic/polymorphic prop shapes (e.g. `Omit<ComponentPropsWithoutRef<T>, "as">`)
      // need `type`, not `interface` — leave the choice to the author.
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
  // Module boundaries (ENGINEERING.md §2 dependency rules).
  // Uses eslint-plugin-boundaries v7's native `policies`/object-selector API.
  // NOTE: the v6 `rules`/tuple-selector API (`["type", { captured }]`) is
  // still *accepted* without error, but same-captured-value self-matching
  // through it silently never matches (confirmed when Phase 2's
  // `modules/content` same-module imports were rejected despite a rule that
  // should have allowed them) — always use the object form below. See BUGS.md.
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*.{ts,tsx}"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**", partialMatch: false },
        // These three are single-file patterns, not folders. `partialMatch:
        // false` expands the pattern as a folder prefix (`<pattern>/**/*`),
        // which never matches an exact file path — so despite the plugin's
        // own deprecation message, `mode: "full"` (old behaviour: match the
        // literal path, no folder expansion) is the only one of the two that
        // actually works here. Kept deliberately; see BUGS.md.
        {
          type: "payload-config",
          pattern: "src/payload.config.ts",
          mode: "full",
        },
        {
          type: "payload-types",
          pattern: "src/payload-types.ts",
          mode: "full",
        },
        {
          type: "module-public",
          pattern: "src/modules/*/index.ts",
          mode: "full",
          capture: ["module"],
        },
        {
          type: "module-internal",
          pattern: "src/modules/*/**",
          partialMatch: false,
          capture: ["module"],
        },
        {
          type: "integrations",
          pattern: "src/integrations/**",
          partialMatch: false,
        },
        { type: "payload", pattern: "src/payload/**", partialMatch: false },
        { type: "ui", pattern: "src/ui/**", partialMatch: false },
        { type: "lib", pattern: "src/lib/**", partialMatch: false },
        { type: "i18n", pattern: "src/i18n/**", partialMatch: false },
        // Single-file, same reasoning as payload-config/payload-types above.
        { type: "proxy", pattern: "src/proxy.ts", mode: "full" },
      ],
    },
    rules: {
      "boundaries/no-unknown-dependencies": "error",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: [
                { to: { element: { type: "app" } } },
                { to: { element: { type: "module-public" } } },
                { to: { element: { type: "ui" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "i18n" } } },
                { to: { element: { type: "payload-config" } } },
                { to: { element: { type: "payload-types" } } },
              ],
            },
            {
              from: { element: { type: "payload-config" } },
              allow: [
                { to: { element: { type: "payload" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "payload-types" } } },
              ],
            },
            {
              from: { element: { type: "module-internal" } },
              allow: [
                {
                  to: {
                    element: {
                      type: "module-internal",
                      captured: { module: "{{from.module}}" },
                    },
                  },
                },
                { to: { element: { type: "integrations" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "ui" } } },
                { to: { element: { type: "i18n" } } },
                { to: { element: { type: "payload-types" } } },
                // Modules reach the DB exclusively through Payload's Local
                // API, so they need `getPayload({ config })` — i.e. the
                // config, never `src/payload/**` (collections/blocks) directly.
                { to: { element: { type: "payload-config" } } },
                // ENGINEERING.md §2: "Modules never import another module's
                // internals — only its index.ts" implies cross-module reads
                // ARE allowed, just only through the public surface.
                { to: { element: { type: "module-public" } } },
              ],
            },
            {
              from: { element: { type: "module-public" } },
              allow: [
                {
                  to: {
                    element: {
                      type: "module-internal",
                      captured: { module: "{{from.module}}" },
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: "integrations" } },
              allow: [{ to: { element: { type: "lib" } } }],
            },
            {
              from: { element: { type: "payload" } },
              allow: [
                { to: { element: { type: "payload" } } },
                { to: { element: { type: "module-public" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "payload-types" } } },
              ],
            },
            {
              from: { element: { type: "ui" } },
              allow: [
                { to: { element: { type: "ui" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "lib" } },
              allow: [{ to: { element: { type: "lib" } } }],
            },
            {
              from: { element: { type: "i18n" } },
              allow: [
                { to: { element: { type: "i18n" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "proxy" } },
              allow: [
                { to: { element: { type: "i18n" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
          ],
        },
      ],
    },
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    // Payload-generated migration files — never hand-edited, always has
    // unused `payload`/`req` args in its up/down template.
    "src/payload/migrations/**",
    // Payload-generated types — regenerate with `pnpm payload:generate-types`.
    "src/payload-types.ts",
    // Payload admin dev server auto-compiles this from importMap.ts on the fly.
    "src/app/(payload)/admin/importMap.js",
  ]),
]);

export default eslintConfig;
