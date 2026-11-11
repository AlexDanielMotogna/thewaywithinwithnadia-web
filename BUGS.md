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

### 2026-10-09 — Reformatted LEGAL.md/CLAUDE.md on first commit (repeat of the Phase 0 `.prettierignore` miss)

- **What happened:** Alex added `LEGAL.md` and `CLAUDE.md` (project governance/legal spec, not ours to reformat) to the repo root. The first commit that touched any tracked file ran lint-staged's `prettier --write`, which rewrote every Markdown table in `LEGAL.md` (column widths, `*italic*` → `_italic_`) before it was noticed.
- **Root cause:** `.prettierignore` only listed the two docs known at Phase 0 (`ENGINEERING.md`, the Master Doc) — a new user-authored doc dropped into the repo root isn't automatically covered, and nothing prompts re-checking that list when one appears.
- **Fix:** restored `LEGAL.md` from lint-staged's own backup commit (`git show <backup-commit>:LEGAL.md`, the "index on master: ..." commit it creates before running tasks — a real recovery path, not just `git checkout --`, since the bad version was already committed by the time this was caught) and added both files to `.prettierignore`.
- **Rule going forward:** whenever a new file appears at the repo root that reads like a spec/governance doc the user authored (not something this session is writing), add it to `.prettierignore` _before_ the next commit touches anything, not after. If caught late, lint-staged's pre-task backup commit (visible via `git log`, message `index on master: ...`) has the pre-format original.

### 2026-10-09 — CSS diagonal gradient on a non-square box: literal `deg` vs `to <corner>`

- **What happened:** three attempts at a diagonal photo-to-solid-color fade in the Cta block before it actually looked diagonal. (1) `bg-gradient-to-r` — straight, not diagonal, per feedback. (2) `linear-gradient(45deg, ...)` with percentage stops — rendered as a near-hard edge (screenshot from Alex): almost the whole box stayed fully opaque, fade only visible in a tiny corner. (3) `clip-path` (diagonal silhouette, pixel offset) + a separate horizontal `mask-image` fade — the silhouette was correctly diagonal, but the fade didn't line up with it at every height (clip-path shortens the top edge; the mask's fade zone was measured from the un-clipped right edge), so the top was a crisp unfaded clip line and only the bottom had visible softness — "now only the gradient is missing."
- **Root cause:** a literal angle (`45deg`) defines the gradient _line_ corner-to-corner **of a square**, mathematically, regardless of the box's actual shape — for a wide/short box that line is far longer than the box's visible diagonal, so percentage-based stops land mostly in the "before the fade starts" zone. The `to <corner>` keyword form (`to top right`, `to top left`, etc.) is different: CSS computes the line **from the element's actual aspect ratio** so it runs corner-to-corner of the real box, which is what makes percentage stops scale correctly for any shape.
- **Fix:** `mask-image: linear-gradient(to top right, black 0%, black 45%, transparent 100%)` (mirrored `to top left` for the other side) — single gradient, no clip-path, no pixel hacks.
- **Rule going forward:** for a diagonal fade/gradient on a box that isn't roughly square, always reach for the `to <corner>` keyword form first, not a literal degree value — it's the one that's aspect-ratio-aware. Save literal angles for boxes you know are square, or for effects where the exact angle (not the corner-to-corner span) is what matters.

### 2026-10-09 — `next/root-params` can't detect `[locale]` nested inside a route group (Next 16.3+)

- **What happened:** Next 16.3 introduced `next/root-params` as next-intl's recommended replacement for the deprecated `requestLocale`/`setRequestLocale` pattern. After moving routes to `(frontend)/[locale]/`, `.next/types/root-params.d.ts` kept saying "No root params detected" — even after a fully successful `next build` that correctly generated working `/en` and `/de` routes (and every nested page under them). Every `root-params` import resolved to `any`, which `@typescript-eslint/no-unsafe-assignment`/`no-unsafe-call` correctly flagged — `tsc --noEmit` stayed clean throughout (it resolves types differently during the build's own pass than the externally-consumed generated `.d.ts` file does), so this only showed up in lint, not typecheck.
- **Root cause:** `next/root-params`'s type generation doesn't look inside route groups for the dynamic segment — it apparently expects `[locale]` directly under `app/`, not `app/(frontend)/[locale]/`. This is a genuine Next.js bug/limitation, not a config mistake on our side.
- **Fix:** abandoned `root-params` entirely. Used the standard `params` prop (typed via `PageProps<'/[locale]/...'>`/`LayoutProps<'/[locale]'>`) plus next-intl's older `requestLocale`/`setRequestLocale`, each wrapped in a narrowly-scoped `// eslint-disable-next-line @typescript-eslint/no-deprecated` comment placed immediately above the actual usage line — not the import. The deprecation lint fires at the call site (`setRequestLocale(locale)`) or the destructuring site (`async ({ requestLocale }) => ...`), so a disable comment above the import does nothing; this took two passes to get right, chasing the exact line number each lint run reported.
- **Rule going forward:** prefer the officially-recommended new API, but verify it actually works end-to-end (not just "docs say to use this") before committing to it — especially right after a Next.js minor/patch bump. A working, deprecated API beats a broken, recommended one. Revisit `root-params` on a future Next upgrade; this may get fixed upstream.

### 2026-10-09 — Case-sensitive `grep "hreflang"` gave a false negative on working hreflang tags

- **What happened:** verifying `buildMetadata()`'s `alternates.languages` output via `curl http://localhost:3000/en | node -e "..."` checking for the literal substring `"hreflang"` returned 0 occurrences, even though `canonical` from the same metadata object rendered fine — looked like a real bug and triggered a source-diving investigation into Next's metadata-resolution internals (`node_modules/next/dist/lib/metadata/`).
- **Root cause:** Next renders the `<link>` tag's attribute using the JSX prop's own casing, `hrefLang` (camelCase), not the lowercase HTML spec spelling `hreflang` — both are valid since HTML attribute names are case-insensitive, and crawlers/browsers treat them identically. The check used a case-sensitive substring match, so it silently missed the (correctly-rendered) tags.
- **Fix:** none needed in the app code — `buildMetadata()` was correct the whole time. Re-verified with a case-insensitive check (`grep -o '<link[^>]*rel="alternate"[^>]*>'`), which showed all three tags (`x-default`, `en`, `de`) present and correct on both `/en` and `/de`.
- **Rule going forward:** when curl/grep-verifying rendered HTML output, don't assume a known HTML attribute will appear in its canonical lowercase spelling — React/Next often emit the JSX prop's exact casing. Use a case-insensitive check, or match on the surrounding tag structure instead of one case-sensitive keyword.

### 2026-10-09 — Missing `"use client"` on a hook broke every Server Component importing `src/ui`

- **What happened:** adding `src/ui/use-zod-form.ts` (a thin wrapper around `react-hook-form`'s `useForm`) and re-exporting it from the `src/ui/index.ts` barrel broke the entire site — every page 500'd with `Export useForm doesn't exist in target module ... [app-rsc]`. The import trace pointed at `footer.tsx` (a Server Component) → `ui/index.ts` → `use-zod-form.ts`.
- **Root cause:** `use-zod-form.ts` had no `"use client"` directive. Next's bundler doesn't know a plain hook file is client-only just because it calls `useForm` — without the directive it gets pulled into the Server Component graph too, and `react-hook-form`'s package exports map a different (much smaller) build under the `react-server` condition that doesn't include `useForm` at all. Any Server Component that transitively imports the `ui/` barrel (which is most of them, since the barrel re-exports everything) hit this the moment the barrel included one client-only file without the marker.
- **Fix:** add `"use client"` as the first line of `use-zod-form.ts`. `TurnstileWidget.tsx` already had it and never had this problem.
- **Rule going forward:** any new file added to a shared barrel (`ui/index.ts`, a module's `index.ts`) that uses client-only hooks (`useState`, `useForm`, browser APIs, event handlers) needs `"use client"` at the top — the barrel re-exports everything together, so a missing directive on just one file takes down every Server Component that imports anything else from the same barrel, not just the one broken file. Confirmed working or not by actually loading a page, not just `tsc`/`eslint` — this class of bug is invisible to both.

### 2026-10-09 — `module-internal → module-public` boundaries policy was simply missing

- **What happened:** `submit-contact-message.ts` (in `modules/contact`) importing `getSiteSettings` from `@/modules/content` (the content module's public `index.ts`) failed lint with `boundaries/dependencies`: "no policy allowing dependencies from ... module-internal ... module=contact to ... module-internal ... module=content".
- **Root cause:** `eslint.config.mjs`'s `module-internal` policy allowed same-module internal imports, `integrations`, `lib`, `ui`, `i18n`, and the Payload config/types — but never `module-public`, even though ENGINEERING.md §2 explicitly documents "Modules never import another module's internals — only its `index.ts`" as the intended cross-module path. This was never exercised before Phase 4 because Phase 2/3's modules (`content`) didn't need to read from each other.
- **Fix:** added `{ to: { element: { type: "module-public" } } }` to the `module-internal` policy's allow list.
- **Rule going forward:** when a new module needs to read another module's public surface for the first time, check whether this is a missing lint policy (a config gap) before assuming the import itself is architecturally wrong — the dependency rules diagram in ENGINEERING.md §2 is the source of truth, the lint config is just catching up to it.

### 2026-10-09 — Exercising `server-only`-guarded code outside Next's own runtime

- **What happened:** wanted to smoke-test `submitContactMessage`/`submitEnquiry` against the real Supabase DB (not just confirm pages render) before committing Phase 4. A plain `tsx` script importing them threw immediately (`server-only`'s module body is a literal `throw` outside the `react-server` condition). Passing `node --conditions=react-server` to dodge that broke a different, unrelated thing: it also strips client-only exports from `react` itself, and the import chain (`submit-contact-message.ts` → `@/modules/content` barrel → `Footer`) pulled in `useState`/`useEffect`, which don't exist in `react-server`'s build of `react` either. A `/api/_temp-*` throwaway route (the pattern that worked for re-seeding in earlier phases) also silently 404'd twice in this session — once directly under `/api`, once placed next to Payload's own catch-all route — for reasons not fully root-caused (Turbopack dev route-manifest staleness is the best guess, but unconfirmed).
- **Fix:** a Vitest test file (not committed) with `vi.mock("server-only", () => ({}))` to neutralize the guard, and `vi.mock("@/modules/content", () => ({ getSiteSettings: ... }))` to short-circuit the barrel before it could pull in `Footer`/`next-intl` navigation (which itself only resolves inside Next's own bundler, not plain Vitest). That let the real `submitContactMessage`/`submitEnquiry` run against the real DB with everything else mocked out of the way; cleaned up both the test file and the DB rows afterward.
- **Rule going forward:** to exercise `server-only`-guarded application code outside the dev server, mock `server-only` directly in a throwaway Vitest file rather than fighting Node's module conditions — and mock any cross-module barrel import that drags in client components/next-intl navigation, since those only resolve inside Next's actual bundler. The `/api/_temp-*` route trick that worked for re-seeding (plain `getPayload`/Local API calls, no `server-only` files in the chain) is NOT reliable for code that imports `server-only` modules or Next-specific virtual modules — don't reach for it there.

### 2026-10-12 — Postgres rejects a `GENERATED ALWAYS AS` column using timestamptz arithmetic

- **What happened:** the booking double-booking exclusion constraint (ENGINEERING.md §5.3) needs a `blocked_until` column (`starts_at + duration + buffer`). Writing it as `GENERATED ALWAYS AS (starts_at + ((duration_min + buffer_min) * interval '1 minute')) STORED` failed with `generation expression is not immutable`. Switching to `to_timestamp(extract(epoch from starts_at) + (duration_min + buffer_min) * 60)` hit the exact same error.
- **Root cause:** Postgres's function-volatility catalog marks essentially every function/operator that produces or consumes a `timestamptz` (the `+` operator, `extract()`, `to_timestamp()`) as `STABLE`, not `IMMUTABLE` — conservatively, because _some_ overloads of those functions depend on the session's timezone setting (e.g. day/month-component interval arithmetic), even though our specific usage (pure minutes, epoch seconds) doesn't. `GENERATED ALWAYS AS` requires a provably `IMMUTABLE` expression, so there is no way to compute a derived `timestamptz` in a generated column with ordinary SQL — this isn't a mistake in the expression, it's a hard Postgres limitation.
- **Fix:** made `blocked_until` a plain (non-generated) column maintained by a `BEFORE INSERT OR UPDATE` trigger (`bookings_set_blocked_until()`), which has no immutability restriction. Still impossible to drift from `starts_at`/`duration_min`/`buffer_min`, however the row is written (app code or the Payload admin UI) — just enforced by a trigger instead of a generated-column expression.
- **Rule going forward:** never reach for `GENERATED ALWAYS AS ... STORED` for a column whose expression touches `timestamp`/`timestamptz` arithmetic in Postgres — it will be rejected regardless of how "obviously immutable" the specific expression looks. Use a `BEFORE INSERT OR UPDATE` trigger instead.

### 2026-10-12 — Registering a Payload Jobs task broke the Payload CLI (`migrate`/`generate-types`)

- **What happened:** after wiring `jobs.tasks` into `payload.config.ts` (so booking confirmation email + calendar sync run as a real queued job, ENGINEERING.md §5.5) and having the task's handler statically `import` `@/modules/booking`, `pnpm payload:generate-types` (and would have hit the same wall on `payload:migrate`) crashed with `server-only`'s "This module cannot be imported from a Client Component module" throw — the same underlying issue as the 2026-10-09 `server-only` entry above, but this time blocking the Payload CLI itself, not just a test script.
- **Root cause:** the Payload CLI (`migrate`, `generate-types`) loads `payload.config.ts` via plain Node/`tsx`, which — unlike Next's own bundler — never sets the `react-server` export condition `server-only` checks for. Every file in `@/modules/booking`'s application/infrastructure layers starts with `import "server-only"` (correctly, per ENGINEERING.md §4.6); statically importing the module's index from a Jobs task file (itself imported by `payload.config.ts`) pulls that whole chain into the CLI's module graph at config-load time, where it has no chance of succeeding — regardless of whether the task ever actually runs under that process.
- **Fix:** made the import inside the task handler a _lazy_ `await import("@/modules/booking")`, done inside the `handler` function body instead of at the top of the file. A dynamic `import()` isn't resolved until the function actually executes, which never happens during `migrate`/`generate-types` (those commands never run a job) — so the CLI's module graph never touches the `server-only` chain at all.
- **Rule going forward:** any file that `payload.config.ts` imports (collections, globals, job tasks, plugins) and that needs to call into a module's `server-only`-guarded application/infrastructure code must do so via a lazy `await import(...)` inside a function body, never a static top-level import — `payload.config.ts`'s own import graph is evaluated by the Payload CLI in plain Node, which cannot satisfy `server-only`'s React Server Components export condition.

### 2026-10-12 — Enabling `jobs.tasks` in `payload.config.ts` doesn't create its own DB schema

- **What happened:** `createBooking` worked fine against the real Supabase DB in every typecheck/lint/test/build pass, but a live smoke test (actually calling it, not just confirming it compiled) threw `relation "payload_jobs" does not exist` the moment it tried to queue the booking's side-effect job.
- **Root cause:** this project's Postgres adapter is configured with `push: false` (migrations-only, per ENGINEERING.md §9 — "database changes only via migrations"). Adding `jobs.tasks` to `payload.config.ts` makes Payload aware of its internal `payload-jobs`/`payload-jobs-log` collections at the application level, but with schema push disabled nothing ever generated the migration that actually creates those two tables in the real database — so the feature silently "worked" (typechecked, built, no error until the exact line that tried to `INSERT` into a table that was never created).
- **Fix:** `pnpm payload:migrate:create` to let Payload diff and generate the missing tables, then `pnpm payload:migrate` to apply it. Had to hand-edit the generated migration first: Payload's diff tool doesn't know `bookings.buffer_min` already exists (it was added by an earlier _hand-written_ migration, which Payload's own schema tracking has no visibility into), so it tried to re-add that column — removed the duplicate `ADD COLUMN`/`DROP COLUMN` lines from the generated file's `up()`/`down()` before applying it.
- **Rule going forward:** enabling a new Payload feature that needs its own collections (`jobs.tasks`, and anything else that adds internal collections) requires running `payload:migrate:create` immediately, even if nothing else changed and the build is green — a missing-table error only surfaces at actual runtime, never at typecheck/lint/build time. And after any hand-written migration that touches a column Payload's generator would also manage (like the exclusion-constraint migration's `buffer_min`), expect the _next_ auto-generated migration to try to redo it — review generated migrations for duplicates against hand-written ones before applying.

### 2026-10-12 — Next 16 Cache Components rejects reading "now" during a Client Component's initial render

- **What happened:** `pnpm build` failed on `/book` twice in a row, with two different but related errors: first `Error: Route "/[locale]/book": Next.js encountered uncached or runtime data during prerendering` (an uncached Payload read in the page's Server Component), then — after fixing that — `Error: ...encountered the unstable value \`new Date()\` in a Client Component`, pointing at a `useState(() => startOfDay(new Date()))`lazy initializer in`BookingFlow`.
- **Root cause:** Next 16's Cache Components feature treats a page as prerenderable/cacheable by default, and rejects anything that could make the prerendered output stale or non-deterministic: an uncached DB read, _and_ a Client Component reading the current time during its initial render (which still happens once on the server during prerendering, same as any Server Component's first pass) — a `useState` lazy initializer runs during that same initial render, so it counts.
- **Fix:** for the DB read, wrapped `listBookableServices()` with `"use cache"` + `cacheLife("minutes")` (the same pattern already used in `modules/content`). For the client-side date, removed the lazy initializer entirely and instead set the "now" value inside `chooseService` — a genuine event handler, which only ever runs after the user clicks something, never during the initial render/prerender pass.
- **Rule going forward:** in a Client Component, never read `new Date()` (or anything else non-deterministic) in a `useState` lazy initializer, in a plain variable at the top of the component body, or in a JSX attribute computed at render time — all of those execute during the same initial-render pass Next tries to prerender/cache. The _tempting_ fix — move it into a `useEffect` that runs once on mount and calls `setState` — trades this error for a different lint failure (`react-hooks/set-state-in-effect`, "Avoid calling setState() directly within an effect"). The clean way out of both: if the value is only ever needed once a user has already interacted with the component (true here — the date is only used once a service is chosen), compute and store it inside that interaction's own event handler instead of a mount effect.

### 2026-10-28 — Booking side-effect jobs reported success when Google/email failed

- **What happened:** `processBookingSideEffects` swallowed calendar and email failures (it only skipped the "mark done" step) and returned normally, so Payload marked the job completed. The code comment said "the job framework's own retry will try again", but nothing ever retried: the task had no `retries` and never threw. A failed calendar event or confirmation email was silently lost. The same job also still created the event and sent "confirmed" for a booking cancelled before the job ran, and a cancellation made from the admin `status` dropdown never deleted the calendar event (only `cancelBooking()` did, inline in the request).
- **Fix:** the job now throws after trying every step if any failed, and both booking tasks have `retries` (5 attempts, exponential backoff, `src/payload/jobs/retry-policy.ts`). Steps are idempotent, so a retry only redoes the failed one. It returns early for inactive bookings (`isActiveBooking`). Calendar removal moved out of `cancelBooking`/`rescheduleBooking` into a `removeBookingCalendarEvent` job queued from a Bookings `afterChange` hook, so every path (use case or admin edit) gets it.
- **Rule going forward:** a Payload job handler must throw on failure. Returning normally means "done", whatever the comment says. Pair every task that calls an external service with a `retries` config.
- **Also found:** a live Vitest run against Payload needs the `@payload-config` alias (added to `vitest.config.mts`) and, for anything importing the `@/modules/booking` barrel, a `vi.mock` of the barrel (same next-intl issue as the 2026-10-09 entry above).

### 2026-10-28 — Admin had no custom components: empty `importMap.ts` shadowed the generated `importMap.js`

- **What happened:** adding the first custom admin component (Google Calendar controls) and checking the generated import map showed that the admin layouts import `./admin/importMap`, which resolved to a committed, hand-made `importMap.ts` containing `export const importMap = {}`. Payload's real generated file, `importMap.js`, was in `.gitignore`. TypeScript/Next resolve `.ts` before `.js`, so the admin always got the empty map: no custom components, and none of Payload's own mapped components either (the Lexical rich-text field, the dashboard collection cards, the S3 client upload handler). It went unnoticed because the admin had barely been used and the build does not check the map.
- **Fix:** deleted `importMap.ts`, removed `importMap.js` from `.gitignore` and committed it (Payload's convention: the generated file is part of the repo). Verified the admin dashboard, the services list and the new calendar page render with the components.
- **Rule going forward:** after adding or changing any admin component path in the Payload config, run `pnpm payload generate:importmap` and commit `src/app/(payload)/admin/importMap.js`. Never hand-write an `importMap.ts`.

### 2026-11-09 — Booking jobs were queued but never ran (no emails, no calendar events since Phase 5)

- **What happened:** a real end-to-end booking test showed every `processBookingSideEffects` job sitting in `payload_jobs` with `total_tried: 0`. No confirmation email and no calendar event had ever been produced for a booking made on the site.
- **Root cause:** Payload only schedules the `jobs.autoRun` cron when it is initialised with `getPayload({ config, cron: true })`. The site's own code calls `getPayload({ config })`; only Payload's admin passes `cron: true`. So the queue was only processed while someone had the admin open.
- **Fix:** `src/instrumentation.ts` (Next's server-start hook) imports `src/payload-cron.ts`, which calls `getPayload({ config, cron: true })` once in the Node runtime. Verified by the Playwright E2E test, which waits for `confirmationSentAt`, `ownerNotifiedAt` and `cancellationSentAt` to be set by the jobs.
- **Rule going forward:** "the job was queued" is not "the job ran". Any test of a side effect must wait for its marker in the database.

### 2026-11-09 — `pnpm build` Turbopack panic after installing Playwright (dangling `@esbuild/*` links)

- **What happened:** after `pnpm add -D @playwright/test …`, `pnpm build` crashed with `TurbopackInternalError … esbuild/lib/main.js [externals-tracing] … Path …/@esbuild/aix-ppc64 could not be resolved`, even with today's code changes stashed.
- **Root cause:** on this Windows machine pnpm leaves symlinks for esbuild's other-platform optional packages (`@esbuild/aix-ppc64`, `darwin-*`, `linux-*` …) that point to folders which were never installed. Installing Playwright gave `next` a new peer-variant folder (`@playwright/test` is an optional peer of `next`), and Turbopack's externals tracing now walks esbuild's package folder and panics on the first broken link.
- **Fix:** delete the dangling links (they point nowhere), then build:
  `cd node_modules/.pnpm && for l in $(find . -maxdepth 4 -path "*/node_modules/@esbuild/*" -type l); do [ -e "$l" ] || rm "$l"; done`
- **Rule going forward:** if the build panics on an `@esbuild/<platform>` path after any `pnpm install`/`add` on Windows, run the command above. Linux CI/Railway installs are not affected (no other-platform links are created there).

### 2026-11-09 — Muted text (`text-charcoal/60`) failed WCAG contrast site-wide

- **What happened:** the first axe-core run in E2E reported `color-contrast` (serious) on `/en/book`, `/en` and `/en/contact`: `text-charcoal/60` on ivory is 3.98:1, below the 4.5:1 required for normal text (WCAG 1.4.3, LEGAL.md §3.2).
- **Fix:** all muted text uses `text-charcoal/70` (5.40:1 on ivory, 5.15:1 on ivory-dark). Booking flow, slot picker, footer, language switcher, contact/enquiry forms, `FormField` hint.
- **Rule going forward:** don't go below `/70` for charcoal text on the ivory backgrounds; axe in E2E fails the build on serious/critical violations.
