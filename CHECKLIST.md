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

## Phase 1 — Payload CMS backbone

- [ ] Payload 3 installed inside Next app, Postgres adapter, local Postgres (Docker)
- [ ] Collections: Services, Bookings, AvailabilityRules, AvailabilityExceptions, Enquiries, Media, Pages, Users
- [ ] Globals: SiteSettings, Navigation, BookingSettings
- [ ] EN/DE localization on editable fields
- [ ] Access control functions per collection
- [ ] Roles: admin (Nadia), developer
- [ ] Media storage adapter (S3-compatible, EU)

## Phase 2 — Page builder + core pages

- [ ] Block registry (`modules/content/render-blocks.tsx`) with `satisfies` exhaustiveness
- [ ] Blocks: Hero, Quote, TextImage, Principles, ServicesPreview, CTA
- [ ] Home page assembled from blocks
- [ ] Journey to Self page assembled from blocks (content ready from Journey_to_Self_Introduction.pdf)
- [ ] Hotels & Spas page assembled from blocks
- [ ] Mobile-first responsive pass (375 / 768 / 1440) per block as built

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
