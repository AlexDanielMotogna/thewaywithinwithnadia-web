# CHECKLIST.md — build progress

Tracks progress against the build order in ENGINEERING.md §13. Check items off as they're
done; add sub-items as work is broken down further. This is the single place to look to
answer "where are we?" at the start of a new session.

---

## Phase 0 — Repo foundation & tooling
- [ ] git init + initial commit
- [ ] pnpm + Node LTS pin (`.nvmrc`, `engines`)
- [ ] Next.js (App Router) + TypeScript strict scaffold
- [ ] `tsconfig.json` strict flags (ENGINEERING.md §4)
- [ ] ESLint (typescript-eslint strict + boundaries + jsx-a11y + no-floating-promises) + Prettier
- [ ] Husky + lint-staged
- [ ] `lib/env.ts` — Zod-validated env, fail-fast at boot
- [ ] Tailwind v4 + `@theme` design tokens (colour, type scale, spacing, radii, motion)
- [ ] `next/font` setup (primary serif, secondary sans, script accent)
- [ ] `src/ui/` primitives: Container, Section, Stack, Heading, Text, Script, Button/LinkButton, Divider, Image, Icon, FormField, Dialog, Reveal
- [ ] Folder structure per ENGINEERING.md §2 (`modules/`, `integrations/`, `payload/`, `lib/`, `i18n/`, `messages/`)
- [ ] CI pipeline stub (typecheck → lint → unit → integration → build → e2e → lighthouse)

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
