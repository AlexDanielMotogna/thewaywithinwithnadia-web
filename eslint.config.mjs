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
          allowDefaultProject: ["eslint.config.mjs"],
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
  // NOTE: written before any `modules/` code exists — re-validate against a real
  // cross-module import violation once Phase 2 lands (see CHECKLIST.md Phase 0).
  // NOTE: uses eslint-plugin-boundaries' v6 `rules`/string-selector API, which
  // v7 deprecates in favour of `policies`/object selectors (still functional,
  // just emits warnings) — migrate once the new API is verified. See BUGS.md.
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*.{ts,tsx}"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**", mode: "full" },
        {
          type: "module-public",
          pattern: "src/modules/*/index.ts",
          mode: "full",
          capture: ["module"],
        },
        {
          type: "module-internal",
          pattern: "src/modules/*/**",
          mode: "full",
          capture: ["module"],
        },
        { type: "integrations", pattern: "src/integrations/**", mode: "full" },
        { type: "payload", pattern: "src/payload/**", mode: "full" },
        { type: "ui", pattern: "src/ui/**", mode: "full" },
        { type: "lib", pattern: "src/lib/**", mode: "full" },
        { type: "i18n", pattern: "src/i18n/**", mode: "full" },
      ],
    },
    rules: {
      "boundaries/no-unknown": "error",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["module-public", "ui", "lib", "i18n"] },
            {
              from: "module-internal",
              allow: [
                ["module-internal", { module: "${module}" }],
                "integrations",
                "lib",
                "ui",
              ],
            },
            {
              from: "module-public",
              allow: [["module-internal", { module: "${module}" }]],
            },
            { from: "integrations", allow: ["lib"] },
            { from: "payload", allow: ["module-public", "lib"] },
            { from: "ui", allow: ["ui", "lib"] },
            { from: "lib", allow: ["lib"] },
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
  ]),
]);

export default eslintConfig;
