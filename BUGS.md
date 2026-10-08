# BUGS.md — mistakes & lessons learned

A log of mistakes made during this project (bugs shipped, wrong approaches taken, footguns
hit) so they don't get repeated. Not a general bug tracker for open issues — it's a memory
of what went wrong and why, written _after_ a mistake is understood, so the next session
(human or Claude) reads this before repeating the pattern.

Each entry: what happened, root cause, the fix, and the rule going forward.

---

## Format

### YYYY-MM-DD — short title

- **What happened:** observed bug/mistake
- **Root cause:** why it happened
- **Fix:** what resolved it
- **Rule going forward:** the concrete thing to do differently next time

---

## Entries

### 2026-10-09 — `create-next-app` refuses to scaffold into a non-empty directory

- **What happened:** `pnpm create next-app@latest .` failed because the repo already had ENGINEERING.md, the Master Doc, PENDING.md etc. in it.
- **Root cause:** create-next-app hard-refuses any directory with conflicting files, no override flag.
- **Fix:** scaffolded into a sibling temp directory instead, deleted its nested `.git`, moved every generated file/folder (except `node_modules`/`.next`) into the real project directory, then `pnpm install` fresh there.
- **Rule going forward:** when scaffolding a framework CLI into a repo that already has files, always scaffold to a throwaway sibling dir and merge — don't fight the CLI's empty-dir check.

### 2026-10-09 — `tsc` fails on `LayoutProps<"/">` — "Cannot find name"

- **What happened:** `pnpm typecheck` failed on `src/app/layout.tsx` even though the exact same code typechecks fine under `next build`.
- **Root cause:** Next.js 16 generates route/layout prop types (`.next/types/**`) as part of `next dev`/`next build`; a bare `tsc --noEmit` run before either of those has happened has no route types to resolve the ambient `LayoutProps` global against.
- **Fix:** added `next typegen` (Next 16's standalone type-generation command) as a prestep: `"typecheck": "next typegen && tsc --noEmit"`.
- **Rule going forward:** on Next.js 16+, never run `tsc --noEmit` standalone in CI/scripts without `next typegen` first — the ambient route types aren't a type-only artifact, they're generated.

### 2026-10-09 — Tailwind v4 `@theme` custom properties referencing `next/font` CSS vars

- **What happened:** first draft of `globals.css` put `--font-serif: var(--font-serif)` etc. inside a plain `@theme { ... }` block.
- **Root cause:** `next/font`'s `variable` option defines the actual CSS custom property at runtime (via a class on `<html>`), not inside the theme layer — a plain `@theme` block tries to resolve theme values eagerly and the reference is circular/undefined from Tailwind's point of view.
- **Fix:** moved the three font var re-exports into a separate `@theme inline { ... }` block (the pattern the stock Next+Tailwind v4 scaffold already uses for Geist), which tells Tailwind to inline the `var()` reference as-is instead of resolving it.
- **Rule going forward:** any `@theme` entry whose value is itself `var(--something)` set outside the CSS (JS-injected, like next/font) belongs in `@theme inline`, never plain `@theme`.

### 2026-10-09 — eslint-plugin-boundaries: same-type imports blocked by default

- **What happened:** after wiring up the module-boundaries ESLint rule, linting failed on `src/ui/index.ts` (ui barrel importing from other `ui/*` files) and `src/lib/cn.test.ts` (lib importing from lib) with "no policy allowing dependencies from elements of type X to elements of type X".
- **Root cause:** `boundaries/element-types` defaults to `disallow` for everything not explicitly listed, including a type importing from its own type — same-type access isn't implicitly allowed.
- **Fix:** added explicit self-allow rules: `{ from: "ui", allow: ["ui", "lib"] }` and `{ from: "lib", allow: ["lib"] }`.
- **Rule going forward:** when adding a new element type to the boundaries config, always ask "can files of this type import siblings of the same type?" and add the self-rule explicitly — it is never implied.

### 2026-10-09 — eslint-plugin-boundaries v7 deprecation warnings (not yet fixed)

- **What happened:** the boundaries config (written against the v6 API: `mode: "full"`, string/tuple element selectors, `rules` option, `${var}` template syntax) lints correctly but prints ~8 deprecation warnings on every run under eslint-plugin-boundaries 7.2.0.
- **Root cause:** v7 renamed most of the config surface (`rules` → `policies`, string selectors → `{ element: { type } }` objects, `${module}` → `{{module}}`, etc.) but kept the old API working as a deprecated alias.
- **Fix:** not applied — deliberately left on the old (working, verified) syntax rather than guessing the new object-based API without being able to check its exact shape against docs.
- **Rule going forward:** migrate `eslint.config.mjs`'s boundaries block to the v7 `policies` syntax next time `eslint-plugin-boundaries` docs/changelog can be consulted directly — don't blind-migrate a working enforcement rule on recollection alone.

### 2026-10-09 — `pnpm format` reformatted the user's own spec docs

- **What happened:** ran `prettier --write .` repo-wide to set up formatting; it rewrote every Markdown table in ENGINEERING.md and the Master Build Doc (whitespace/column-width only, no content change) before I noticed in `git status`.
- **Root cause:** `prettier --write .` has no concept of "files I don't own" — it formats everything matching its glob, including docs the user authored and pasted in, not just code this session is producing.
- **Fix:** reverted both files with `git checkout --`, added `.prettierignore` listing them explicitly.
- **Rule going forward:** before running a repo-wide formatter/linter with `--write`/`--fix` for the first time, check `git status` after and revert anything outside what this session is actually authoring — don't assume "it's just formatting" makes it fine to touch someone else's source document.

### 2026-10-09 — Vitest native config loader warnings

- **What happened:** `pnpm test` printed Vite warnings: `vitest.config.ts` loaded as CommonJS despite ESM syntax, and `__dirname` used instead of `import.meta.dirname`.
- **Root cause:** a `.ts` extension at the project root is ambiguous (CJS vs ESM) without `"type": "module"` in package.json; `__dirname` doesn't exist in true ESM.
- **Fix:** renamed to `vitest.config.mts` (unambiguous ESM) and switched to `import.meta.dirname`.
- **Rule going forward:** new root-level `.ts` config files in this repo should default to `.mts` to avoid the CJS/ESM ambiguity warning, since package.json intentionally doesn't set `"type": "module"` (Next.js convention).
