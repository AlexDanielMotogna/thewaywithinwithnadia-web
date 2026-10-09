# CHECKLIST.md — build progress

Tracks progress against the build order in ENGINEERING.md §13. Check items off as they're
done; add sub-items as work is broken down further. This is the single place to look to
answer "where are we?" at the start of a new session.

---

## Phase 0 — Repo foundation & tooling ✅ 2026-10-09

- [x] git init + initial commit
- [x] pnpm + Node LTS pin (`.nvmrc` → Node 24, `engines`)
- [x] Next.js 16 (App Router, Turbopack) + TypeScript strict scaffold
- [x] `tsconfig.json` strict flags (ENGINEERING.md §4)
- [x] ESLint (typescript-eslint strict+stylistic type-checked, boundaries, jsx-a11y via eslint-config-next, no-floating-promises) + Prettier (+ prettier-plugin-tailwindcss)
- [x] Husky + lint-staged (pre-commit: eslint --fix + prettier --write)
- [x] `src/lib/env.ts` — Zod-validated env, fail-fast at boot
- [x] Tailwind v4 + `@theme` design tokens (colour, type scale, spacing, radii, motion) in `src/app/globals.css`
- [x] `next/font` setup — Playfair Display (serif), Inter (sans), Allura (script) in `src/lib/fonts.ts`
- [x] `src/ui/` primitives: Container, Section, Stack, Heading, Text, Script, Button/LinkButton, Divider, Image, Icon, FormField, Dialog, Reveal
- [x] Folder structure per ENGINEERING.md §2 (`modules/`, `integrations/`, `payload/`, `lib/`, `i18n/` — each with a README stub; `messages/` deferred to Phase 3)
- [x] CI pipeline stub (`.github/workflows/ci.yml`: typecheck → lint → unit → build; integration/e2e/lighthouse steps added when those phases land)
- [x] Vitest wired up (`vitest.config.mts`), first test (`src/lib/cn.test.ts`) passing
- [x] Verified end-to-end: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all pass; `pnpm dev` smoke-tested with curl

Font choices (Playfair Display / Inter / Allura) are a reversible implementation
decision, not a business fact — revisit if Nadia has a preference once she sees it.

## Phase 1 — Payload CMS backbone ✅ 2026-10-09

- [x] Payload 3 installed inside Next app, Postgres adapter — **Supabase** instead of local Docker Postgres (decision in PENDING.md resolved #1)
- [x] Collections: Services, Bookings, AvailabilityRules, AvailabilityExceptions, Enquiries, Media, Pages, Users
- [x] Globals: SiteSettings, Navigation, BookingSettings
- [x] EN/DE localization on editable fields (`localized: true` on copy fields; IDs/numbers/relationships left unlocalized)
- [x] Access control functions per collection — public read only for published Pages / active Services / Media; Bookings, Enquiries, Availability, Users never publicly readable or writable (see BUGS.md for the "public create" mistake caught before commit)
- [x] Roles: admin / developer (`Users.role` select field)
- [x] Media storage adapter — Supabase Storage via `@payloadcms/storage-s3`, conditionally enabled when `S3_*` env vars are present, falls back to local disk otherwise
- [x] Block schemas for the page builder (Hero, Quote, TextImage, Principles, ServicesPreview, Cta) wired into the `Pages` collection's `blocks` field — React components for these come in Phase 2
- [x] `src/app/(payload)/` admin UI + REST + GraphQL routes
- [x] Initial migrations generated and applied against Supabase (two migrations: Users+Media, then everything else)
- [x] `src/payload-types.ts` generated
- [x] Verified end-to-end: typecheck/lint/test/build all pass; `/admin` loads and correctly redirects to create-first-user against the real Supabase DB

Not yet done (deferred, noted in PENDING.md): actually creating the first admin user (needs you to open `/admin` in a browser), and confirming the Supabase Storage "media" bucket exists / a real upload works end-to-end.

## Phase 2 — Page builder + core pages ✅ (pending visual QA) 2026-10-09

- [x] Block registry (`src/modules/content/ui/render-blocks.tsx`) — a `switch` over `blockType`, not the literal `satisfies`-registry sketched in ENGINEERING.md §3 (that pattern needs `ComponentType<any>`, which this repo's lint forbids); `@typescript-eslint/switch-exhaustiveness-check` gives the same "new block type breaks the build" guarantee
- [x] Blocks: Hero, Quote, TextImage, Principles, ServicesPreview, Cta — all in `src/modules/content/ui/blocks/`
- [x] Home page assembled from blocks (`src/app/(frontend)/page.tsx`, slug `home`)
- [x] Journey to Self page assembled from blocks (`src/app/(frontend)/journey-to-self/`, slug `journey-to-self`) — content from Master Doc §7, restructured into a narrative per that section's own instruction
- [x] Hotels & Spas page assembled from blocks (`src/app/(frontend)/hotels-spas/`, slug `hotels-spas`) — content from Master Doc §10; the real enquiry form stays Phase 4 work
- [ ] Mobile-first responsive pass (375 / 768 / 1440) — **not done**: built with the existing responsive Tailwind tokens/conventions throughout, but not yet visually checked in a real browser at each breakpoint
- [x] Visual design pass to match the client-shared mockup (`El camino interior_ bienestar mediterráneo (1).png`) — Hero rewritten as full-bleed photo with centered overlay content + floating top bar; TextImage now bleeds its image to the section edge; Cta redesigned with an asymmetric photo-bleeding-into-olive treatment (`imagePosition`); Quote can carry an optional full-bleed background photo; ServicesPreview got a lotus divider + circular arrow accent; added a sitewide `Footer` (logo, nav, social icons from `SiteSettings` when present). All 10 client-supplied photos uploaded to Supabase Storage and attached. Not pixel-matched (no browser screenshot tool in this environment) — verified structurally (HTML output) and via typecheck/lint/test/build only; **ask the user to eyeball `localhost:3000` and flag anything off**.

## Phase 3 — i18n routing + SEO foundation

- [ ] next-intl `/en/` `/de/` routing + localized pathnames
- [ ] Language switcher (preserves route)
- [ ] `buildMetadata()` helper (title, description, canonical, OG, hreflang, x-default)
- [ ] Sitemap, robots.txt, heading hierarchy, schema markup
- [ ] `messages/en.json`, `messages/de.json`

## Phase 4 — Contact + Hotels & Spas enquiry

- [ ] `useZodForm` + `<FormField>` + `protectPublicAction()` (honeypot + Turnstile + rate limit)
- [ ] `modules/contact/` with shared `schemas.ts`
- [ ] `modules/enquiries/` with shared `schemas.ts`
- [ ] `Mailer` port + fake/console adapter
- [ ] Hotels & Spas enquiry fields per Master Doc §10

## Phase 5 — Booking module (critical path)

- [ ] Domain: `computeAvailableSlots()`, `lib/dates.ts` (tz/DST), state machine
- [ ] Unit tests written first — DST, min notice, buffers, exceptions, busy overlaps, day edges
- [ ] DB exclusion constraint (`btree_gist`, `EXCLUDE USING gist`)
- [ ] Application layer: createBooking, cancelBooking, rescheduleBooking (`Result<T, DomainError>`)
- [ ] Integration tests (Testcontainers Postgres) — concurrent double-booking → exactly one success
- [ ] Idempotent jobs: calendar.createEvent → meeting.attach → email.sendConfirmation → email.scheduleReminder
- [ ] BookingFlow / SlotPicker UI
- [ ] Admin availability management via Payload hooks (same `transition()` path)

## Phase 6 — Calendar/Meet/Zoom integration

- [ ] `integrations/calendar/port.ts` + Google adapter + fake adapter
- [ ] Meet via `conferenceData.createRequest`
- [ ] Zoom adapter (if selected — see PENDING.md #2)
- [ ] Free/busy re-check before insert
- [ ] Admin banner when not connected

## Phase 7 — Consent, analytics, music

- [ ] Cookie/consent gate + Consent Mode v2
- [ ] `track()` typed event union, no-op until consent
- [ ] Audio controller singleton (`useSyncExternalStore`), gesture-gated start
- [ ] Persistent playback across route/locale changes
- [ ] Feature flag `SiteSettings.music.enabled` (OFF until licensing resolved — PENDING.md #6)

## Phase 8 — Accessibility, performance, mobile hardening

- [ ] axe-core zero serious/critical violations, all pages
- [ ] Lighthouse CI budgets (Home, Services, Book — mobile)
- [ ] Keyboard nav, visible focus, reduced-motion, alt text
- [ ] Full responsive QA pass, all pages, three breakpoints

## Phase 9 — Launch checklist

- [ ] Domain + HTTPS
- [ ] GA4 / Search Console connected
- [ ] Sitemap submitted
- [ ] Backups + tested restore
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Final EN content QA; DE as available
- [ ] Logo finalized (SVG, PNG, light/dark/background-safe variants)

---

## Session log

_(one line per work session: date, what moved, what's next — keep it short)_

- 2026-10-09 — Repo had only docs + reference PDFs. Read ENGINEERING.md, Master Doc, both PDFs. Wrote implementation plan. Created PENDING.md, CHECKLIST.md, BUGS.md. Starting Phase 0.
- 2026-10-09 — Phase 0 complete: Next.js 16 + TS strict + Tailwind v4 scaffolded, tooling (ESLint/Prettier/Husky/Vitest/CI) wired up, design tokens + fonts set, `src/ui/` primitives built, folder skeleton in place. All checks green (typecheck/lint/test/build). See BUGS.md for issues hit and fixed along the way. Next: Phase 1 (Payload CMS backbone) — needs hosting decision (PENDING.md #1) before DB/storage provisioning.
- 2026-10-09 — Decided database: Supabase (managed Postgres, EU region) — see PENDING.md resolved #1. Scaffolded `.env.example` (committed) and `.env.local` (gitignored, blank) with the Supabase connection strings, `PAYLOAD_SECRET` and S3-compatible storage vars Payload will need; wired them into `src/lib/env.ts` as optional for now (becomes required once Payload is installed in Phase 1). Still open: app hosting (PENDING.md #14) and actual Supabase project credentials (PENDING.md #15, blocked on Alex creating the project).
- 2026-10-09 — Supabase project created, real credentials obtained and verified (both DATABASE_URL pooled and DIRECT_URL connect; PENDING.md #15 resolved). Phase 1 complete: Payload 3 installed and fully wired (all collections/globals/blocks, admin+REST+GraphQL routes, migrations applied against the real Supabase DB, types generated). `"type": "module"` added to package.json to fix a Payload CLI/Node ESM incompatibility (see BUGS.md). Next: Phase 2 (page builder + core pages) — the block React components (Hero, Quote, TextImage, Principles, ServicesPreview, Cta) now need `render-blocks.tsx` implementations to actually render the Pages collection's data. Before that, open the live `/admin` and create the first user.
- 2026-10-09 — Alex opened `/admin` in a real browser and hit a nested `<html>`/`<body>` hydration crash (shared `src/app/layout.tsx` was double-rendering a document shell alongside Payload's own `RootLayout`). Fixed by splitting into two parallel route groups, `src/app/(frontend)/` and `src/app/(payload)/`, each with its own independent root layout — no more shared ancestor layout above either. Typecheck/lint/test/build all re-verified green after the restructure. See BUGS.md. Dev server restarted; `/admin` and `/` both smoke-tested again. Still waiting on PENDING.md #16 (create first admin user in browser) and #17 (confirm media bucket upload).
- 2026-10-09 — Phase 2 complete: built `src/modules/content/` (block registry + Hero/Quote/TextImage/Principles/ServicesPreview/Cta React components, both backed by Payload's generated types, no hand-duplicated shapes) and wired `/`, `/journey-to-self`, `/hotels-spas` to fetch and render real `Pages` docs. Made `Services.durationMin`/`.price` and `TextImage.image` optional (pricing and photography are both genuinely undecided yet — PENDING.md #18/#19 — rather than inventing placeholder numbers or blocking on stock images); new migration applied. Seeded the 5 real services and all 3 real pages from Master Doc §6/§7/§10 copy via `scripts/seed.ts` / `seed-data.ts` (`pnpm payload:seed` — though see BUGS.md, `payload run` itself hung silently in this environment; seeding actually ran through a temporary route hit against the live `next dev` server, since that path works reliably). Migrated `eslint.config.mjs`'s module-boundaries rule from the v6 tuple/`${...}` syntax to v7's native `policies`/object-selector syntax — the v6 form was silently never matching same-module self-imports, which Phase 2 was the first real test of (see BUGS.md, long-flagged as unverified since Phase 1). Also hit and fixed a Next 16 Cache Components build failure (`"use cache"` + `cacheLife` now wrap both Payload reads in `src/modules/content/infrastructure/`). All three pages verified rendering their real seeded content end-to-end against the live Supabase DB; typecheck/lint/test/build all green. Not done: the mobile-responsive visual QA pass (PENDING items #16/#17 still open too). Next: Phase 3 (i18n routing + SEO foundation) — note the architecture diagram in ENGINEERING.md §2 expects routes under `(frontend)/[locale]/`, so Phase 3 will need to move these three pages under a locale segment.
- 2026-10-09 — Alex shared a ChatGPT-generated mockup (`El camino interior_ bienestar mediterráneo (1).png`) with 10 matching photos and asked for the design to match it closely. Uploaded/attached all 10 photos (blocked twice along the way: the Supabase bucket was typo'd as "madia", and `PAYLOAD_SECRET` went empty in `.env.local` mid-session — both fixed, see BUGS.md). Redesigned Hero (full-bleed photo, centered overlay, sunburst ornament, floating top bar), TextImage (image now bleeds to the section edge instead of sitting in a rounded box), Cta (asymmetric photo-bleeding-into-olive band instead of a flat overlay), added an optional background photo to Quote, added a small arrow accent to ServicesPreview cards, and built a sitewide `Footer` (logo, nav, social icons). Converted the home page's "Hotels & Spas teaser" block from Cta to TextImage+CTA to match the mockup's split (not full-bleed) layout there. Re-ran the seed + media-attach scripts against the new structure. Typecheck/lint/test/build all green; verified structurally via HTML output (no browser screenshot tool available in this environment, so not pixel-compared) — **still needs the user to open `localhost:3000` and confirm it actually looks right**.
