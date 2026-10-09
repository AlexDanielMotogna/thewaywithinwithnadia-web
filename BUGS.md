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
- **Rule going forward:** new root-level `.ts` config files should be unambiguous about their module type. (Superseded 2026-10-09: package.json now sets `"type": "module"` repo-wide — see the Payload CLI entry below — so this is no longer actually ambiguous, but `.mts` for scripts stays harmless and explicit.)

### 2026-10-09 — Payload CLI crashes with `ERR_REQUIRE_ASYNC_MODULE`

- **What happened:** `payload migrate:create` (and any other Payload CLI command) crashed immediately: `Error [ERR_REQUIRE_ASYNC_MODULE]: require() cannot be used on an ESM graph with top-level await`, tracing through `@payloadcms/richtext-lexical`.
- **Root cause:** without `"type": "module"` in package.json, Node treats `.ts`/`.js` files as CommonJS by default. Payload's CLI loads `payload.config.ts` via `tsx`, which then `require()`s `@payloadcms/richtext-lexical` — an ESM package that uses top-level `await` internally. Node's CJS loader cannot synchronously `require()` an ESM module with top-level await, so it throws instead of transparently interop-ing.
- **Fix:** added `"type": "module"` to package.json. Verified afterward that `typecheck`/`lint`/`test`/`build` all still pass — Next.js 16 handles an ESM-mode project fine, nothing else in the repo assumed CJS.
- **Rule going forward:** if a Payload CLI command fails with `ERR_REQUIRE_ASYNC_MODULE`, the fix is `"type": "module"` in package.json, not fighting tsx flags or downgrading packages.

### 2026-10-09 — `ignoredBuiltDependencies: [sharp]` silently breaks Payload's image resizing

- **What happened:** `create-next-app`'s default `pnpm-workspace.yaml` had `ignoredBuiltDependencies: [sharp, unrs-resolver]`. After adding `sharp` as a real dependency for Payload (which uses it for media resizing), its postinstall/binary-resolution step was still being skipped.
- **Root cause:** `ignoredBuiltDependencies` was copied from the scaffold without re-checking it once `sharp` became an actual, load-bearing dependency rather than an unused optional one.
- **Fix:** replaced `ignoredBuiltDependencies` with an explicit `onlyBuiltDependencies: [esbuild, sharp]` allowlist in `pnpm-workspace.yaml`, then `pnpm install` and verified `require('sharp')` loads with a real `versions` object.
- **Rule going forward:** whenever a new dependency is added that ships native/platform binaries (sharp, esbuild, better-sqlite3, etc.), check `pnpm-workspace.yaml`'s build-script allow/ignore lists — don't assume scaffold defaults still make sense.

### 2026-10-09 — eslint-plugin-boundaries needs an explicit entry for every new top-level file/type, including self-imports

- **What happened:** as Payload's config (`src/payload.config.ts`), generated types (`src/payload-types.ts`), generated migrations, and the `src/app/(payload)/` route group were added, lint kept failing with "no policy allowing dependencies from elements of type X to elements of type X" (app→app, payload→payload) and "dependencies to unknown elements" for files that matched no configured pattern.
- **Root cause:** same root issue as the earlier ui→ui/lib→lib entry (see above): boundaries requires every file to match a type, and same-type imports are never implicit. Every new "kind" of file added to the repo (a config file, a generated-types file) needs its own element-type entry before anything can import it.
- **Fix:** added `payload-config` and `payload-types` element types (matching the exact files), added `app`→`app` and `payload`→`payload` self-allow rules, and excluded generated migrations/`payload-types.ts` from linting entirely via `globalIgnores` (they're regenerated, never hand-edited, and contain patterns — unused args, a tslint-disable comment — that fail strict rules by design).
- **Rule going forward:** when adding a new root-level generated or config file, decide up front whether it (a) needs a boundaries element-type entry because real code will import it, or (b) should just go in `globalIgnores` because it's generated and nothing should import it directly except through its own alias. Check both.

### 2026-10-09 — Bookings/Enquiries collections briefly had public `create` access

- **What happened:** first draft of the `Bookings` collection set `create: () => true` (public), reasoning that visitors need to create bookings without an account.
- **Root cause:** conflated "the public needs to be able to trigger a booking" with "the public REST API should accept raw booking writes." Payload's **Local API** (used by server-side code) bypasses `access` checks by default — so the real public booking flow (a validated Server Action calling the Local API in Phase 5) never needed public REST access at all. Public `create: true` would have let anyone POST an arbitrary `startsAt`/`status` directly to `/api/bookings`, skipping all slot/double-booking validation.
- **Fix:** caught before ever committing or building — changed to `create: ({ req }) => Boolean(req.user)`, matching Enquiries.
- **Rule going forward:** for any collection the public "submits" to (bookings, enquiries, contact), default `access.create` to authenticated-only. The public submission path belongs in a Server Action using the Local API, never in loosened Payload REST access.

### 2026-10-09 — Nested `<html>`/`<body>` hydration crash on `/admin`

- **What happened:** opening `/admin` in a real browser threw a hydration error and React console spam: "`<html>` cannot be a child of `<body>`", "`<body>` cannot contain a nested `<html>`", "mounting a new html/body component when a previous one has not first unmounted." The page still returned HTTP 200 and basic nav worked, but the DOM was corrupt client-side.
- **Root cause:** `src/app/layout.tsx` (the frontend's root layout) rendered its own `<html>`/`<body>`, and `src/app/(payload)/layout.tsx` wraps children in `@payloadcms/next/layouts`'s `RootLayout`, which **also** renders a full `<html>`/`<body>` document shell internally. Because `(payload)` is a route group nested directly under `src/app/`, Next.js treated `src/app/layout.tsx` as a shared ancestor for every route including `/admin/**`, so both document shells rendered — one nested inside the other.
- **Fix:** moved the frontend's `layout.tsx`/`page.tsx` into their own parallel route group, `src/app/(frontend)/`, and deleted the shared `src/app/layout.tsx` entirely. Now `(frontend)` and `(payload)` are two independent root-layout trees side by side under `src/app/`, each free to render its own `<html>`/`<body>` — this is the structure Payload's own Next.js App Router templates use. `globals.css` stays at `src/app/globals.css` (imported via `../globals.css` from the new location); `favicon.ico` stays at the `src/app/` root (shared special file, not part of either layout tree).
- **Rule going forward:** when a route group's layout renders its own `<html>`/`<body>` (anything using `@payloadcms/next/layouts`' `RootLayout`, or any other "full document" layout from a library), it must never have a shared ancestor `layout.tsx` above it in `src/app/` that also renders `<html>`/`<body>`. Give it its own top-level route group instead of nesting it under the app's existing root layout.

### 2026-10-09 — eslint-plugin-boundaries v6 tuple/template self-match silently never matches (v7 migration forced)

- **What happened:** building Phase 2's `modules/content`, every same-module file (e.g. `render-blocks.tsx` importing `ui/blocks/Hero.tsx`) failed lint with "no policy allowing dependencies from elements of type module-internal ... to elements of type module-internal" — despite a rule written specifically to allow that (`["module-internal", { module: "${module}" }]`, the v6 legacy tuple + `${...}` template syntax the config had used since Phase 1, with a comment noting it was unverified against a real case).
- **Root cause:** the v6 tuple-form selector (`["type", { captured }]`) is still _recognized_ by eslint-plugin-boundaries v7 for deprecation-warning purposes, but doesn't actually get wired into the v7 matcher's evaluation path — same-captured-value self-matching through it never succeeds, silently, no matter how the template resolves.
- **Fix:** migrated the whole `boundaries/elements`/`element-types` config block to v7's native syntax: `policies` (not `rules`), object element selectors (`{ element: { type: "x", captured: { module: "{{from.module}}" } } }`, not tuples), `{{...}}` Handlebars templates (not `${...}`), and `{ to: { element: {...} } }`-wrapped `allow` entries. Also: `payload-config`/`payload-types`/`module-public`'s single-_file_ patterns had to keep `mode: "full"` (not the suggested `partialMatch: false` — that expands the pattern as a folder prefix, `<pattern>/**/*`, which can never match one exact file).
- **Rule going forward:** never use the v6 tuple/string/`${...}` selector forms in this config again, even though the plugin accepts them without erroring — only the v7 object-selector/`policies`/`{{...}}` form is actually verified to work. For a literal single-file element (not a folder), `mode: "full"` is still correct; don't blindly swap it for `partialMatch: false`.

### 2026-10-09 — Next 16 Cache Components: DB reads in a page need `"use cache"` or the build fails

- **What happened:** `pnpm build` failed on `/journey-to-self` with "Next.js encountered uncached or runtime data during prerendering" — a Payload Local API call (`payload.find(...)`) inside an async server component, with no `fetch`/`cookies`/`headers` involved at all.
- **Root cause:** `next.config.ts` has `cacheComponents: true` (Next 16's Cache Components, enabled since Phase 0). Under that model, _any_ uncached async data read inside a component — not just `fetch()` — blocks static prerendering unless it's wrapped in `"use cache"` or the route explicitly opts into streaming/dynamic rendering.
- **Fix:** added `"use cache"` + `cacheLife("minutes")` (from `next/cache`) inside `getPageBySlug()` and `getFeaturedServices()` (`src/modules/content/infrastructure/`). Both are plain async functions, not `fetch` — `"use cache"` works on any async function/component per Next's docs, not just `fetch`-based ones.
- **Rule going forward:** every new Payload Local API read used inside a Server Component in this repo needs `"use cache"` + an explicit `cacheLife()` profile in the same function, or the production build will fail the first time that route is prerendered. Check `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md` for the exact mechanics before assuming an API-route/webhook-based revalidation strategy is needed instead.

### 2026-10-09 — `node_modules/.bin/payload` is a shell script, not a Node script

- **What happened:** a first draft of the `payload:seed` script (`node --env-file=.env.local node_modules/.bin/payload run scripts/seed.ts`) crashed immediately: `SyntaxError: missing ) after argument list` pointing at the bin file's shebang line.
- **Root cause:** `node_modules/.bin/payload` (as installed by pnpm on this machine) is a POSIX `#!/bin/sh` wrapper script, not a Node/JS file — passing it as an argument to `node` makes Node try to parse shell syntax as JavaScript. The _working_ existing scripts (`payload:migrate`, etc.) never actually ran this path directly; they go through `scripts/with-direct-db.mjs`, which shells out via `spawnSync("payload", args, { shell: true })` — invoking the command _by name_ through a shell, letting the shell's shebang/PATH handling do the right thing.
- **Fix:** added `scripts/run-payload.mjs`, the same `spawnSync("payload", ..., { shell: true })` pattern without the `DIRECT_URL` override, and pointed both the `payload` and `payload:seed` package.json scripts at it instead of `node_modules/.bin/payload` directly (the bare `"payload"` script had apparently been broken this way since Phase 1 — it was never actually exercised until now).
- **Rule going forward:** never pass `node_modules/.bin/<cli>` as a path argument to `node`. To invoke a CLI from a script, shell out to it _by name_ (`spawnSync(name, args, { shell: true })`), matching the pattern already proven in `with-direct-db.mjs`.

### 2026-10-09 — `payload run <script>` exits silently without completing (unresolved)

- **What happened:** `pnpm payload:seed` (running `payload run scripts/seed.ts`) consistently exited with code 0 in ~2 seconds, printing nothing — not even Payload's own startup log lines — and created no data. Instrumenting the script showed execution reaching `await getPayload({ config })` and never continuing past it: no error thrown, no `.catch()` triggered, just a quiet exit once the event loop had nothing else to do.
- **What didn't fix it:** switching `DATABASE_URL` for `DIRECT_URL` (ruling out a transaction-pooler/advisory-lock theory); a raw `pg` client against the same `DATABASE_URL` connected and queried in ~200ms (ruling out network/connection-pool exhaustion); waiting several minutes and retrying (ruling out a slow background call like telemetry eventually resolving).
- **Workaround used:** moved the actual seed logic into `scripts/seed-data.ts` (an exported `runSeed(payload)` with no CLI-only code), then ran it once via a temporary Next.js route handler hit through the already-running `next dev` server (which calls `getPayload({ config })` the same way on every request, and works reliably there) — then deleted the temporary route.
- **Rule going forward:** the root cause is still unknown — don't assume `payload run <script>` works reliably in this environment. For any future one-off data script, prefer the temporary-route-through-`next dev` approach over `payload run`, unless this is revisited with Payload's own maintainers/docs. Re-attempt `payload run` with a fresh Payload/tsx version before trusting it again.

### 2026-10-09 — Next.js App Router: a route under a `_`-prefixed folder always 404s

- **What happened:** a temporary route at `src/app/_seed-temp/route.ts` compiled with no errors and showed up in the dev server's request log, but every request to `/_seed-temp` returned a genuine 404 — not a Payload catch-all 404, Next's own "page could not be found."
- **Root cause:** Next.js treats any path segment starting with `_` as a **private folder** — explicitly excluded from routing, by convention, regardless of what files are inside it.
- **Fix:** renamed the folder to `temp-seed-run` (no leading underscore); it routed correctly immediately.
- **Rule going forward:** never prefix a route-segment folder with `_` expecting it to still be routable — that prefix means "never route this," full stop. Use it on purpose for colocated non-route files (helpers, components) under `app/`, never for an actual route folder.

### 2026-10-09 — `import.meta.dirname` is `undefined` when a script is bundled into a Next.js route

- **What happened:** `scripts/attach-media-run.ts` used `path.resolve(import.meta.dirname, "../media-uploads", file)` to locate local photo files. It worked fine typechecked/linted, but crashed at runtime — `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined` — only when the exact same module was imported from a temporary Next.js route handler (the `payload run <script>` workaround from the entry above). Running the equivalent plain-Node/tsx script directly never hit this.
- **Root cause:** `import.meta.dirname` is populated by Node's own ESM loader. Once the module is pulled into Next's Turbopack/webpack bundle for a route handler, it's a different module system/loader entirely, and `import.meta.dirname` comes back `undefined` there — a divergence between "runs under tsx" and "runs bundled inside Next," which is exactly the two contexts these one-off scripts now need to work in (see the `payload run` entry above).
- **Fix:** use `process.cwd()` instead (`path.resolve(process.cwd(), "media-uploads", file)`) — both execution contexts run with the project root as the working directory, so this resolves correctly either way.
- **Rule going forward:** any script written to be dual-purpose (runnable standalone _and_ importable from a temporary Next.js route, per the `payload run` workaround) must use `process.cwd()`, not `import.meta.dirname`/`__dirname`, for resolving project-relative paths.

### 2026-10-09 — Supabase Storage "media" bucket confirmed missing (PENDING.md #17)

- **What happened:** the first real upload attempt (via the `attach-media` script, once the above two bugs were fixed) reached Payload's S3 storage adapter and failed with `NoSuchBucket: Bucket not found`.
- **Root cause:** `S3_BUCKET=media` in `.env.local` names a bucket that was never actually created in the Supabase project's Storage dashboard — the S3 _credentials_ were valid and Payload booted fine with them (that part was verified back in Phase 1), but nothing had ever tried a real upload until now, so the missing bucket went unnoticed.
- **Fix:** not yet fixed — needs Alex to create a bucket named exactly `media` in Supabase (Project Settings → Storage → New bucket), set **public**, since `next/image` needs directly-loadable public URLs, not signed ones.
- **Rule going forward:** "Payload boots with S3 credentials configured" and "the bucket those credentials point at actually exists" are two separate facts — don't treat the first as evidence of the second. This was flagged as an open question in PENDING.md since Phase 1 and nobody had tested it until the Phase 2 photos needed it.
- **Follow-up:** fix attempt #1 still failed the same way. Querying the S3 endpoint directly (`ListBucketsCommand`, bypassing Payload) showed why: the bucket had actually been created as **`madia`** (typo), not `media`. Renamed in the Supabase dashboard; confirmed via the same direct S3 check before retrying through Payload. Lesson: when a fix doesn't work the second time, verify the _exact_ external state yourself (here, a raw S3 client call) rather than re-trying the same higher-level operation and assuming "not yet propagated."

### 2026-10-09 — `PAYLOAD_SECRET` went missing from `.env.local`

- **What happened:** after the bucket got sorted out, the dev server started throwing `Error: missing secret key. A secret key is needed to secure Payload.` on every page load — a route that had been working minutes earlier.
- **Root cause:** `PAYLOAD_SECRET=` in `.env.local` was empty. The file had been hand-edited around this time (while sorting out the S3 bucket name/access key), and the secret's value was lost in the process — not something this session did directly, but surfaced here.
- **Fix:** generated a fresh secret (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) and set it. Safe to regenerate freely at this stage: no admin user exists yet (`PAYLOAD_SECRET` signs auth sessions, not stored content), so there was nothing to invalidate.
- **Rule going forward:** if Payload suddenly can't boot with a "missing secret key" error after `.env.local` was touched for an unrelated reason, check that specific line before assuming something deeper broke — a manual edit to one env var can blank out an adjacent one.

### 2026-10-09 — First design pass washed out the whole hero photo instead of just the text area

- **What happened:** the first Hero/Quote redesign put a `bg-gradient-to-b from-ivory/80 ... to-ivory/55` (Hero) / `bg-ivory/55` (Quote) layer over the _entire_ photo so the text would read. Alex's feedback: the photo should stay at full contrast everywhere — only the small area directly behind the text should be lightened.
- **Root cause:** reached for the simplest legibility fix (a uniform semi-opaque layer over the whole image) instead of a localized one, even though the mockup clearly only lightens a soft area immediately behind the text block, not the whole photo.
- **Fix:** removed the full-bleed overlay in both blocks. Replaced it with a `radial-gradient` div sized to the text container, positioned behind the text (`-z-10`) and blurred (`blur-xl`), using `var(--color-ivory)` directly in an arbitrary Tailwind value (`bg-[radial-gradient(ellipse_60%_65%_at_center,_var(--color-ivory)_0%,...)]`) rather than a plain `bg-ivory/NN` class, since the effect needs an actual gradient shape, not a flat tint.
- **Rule going forward:** for text-over-photo legibility, default to a localized glow/vignette sized to the text block, not a full-image wash — check the mockup's actual treatment before picking the "uniform overlay" shortcut.
