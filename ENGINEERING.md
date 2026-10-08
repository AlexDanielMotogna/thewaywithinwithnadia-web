--> See alway master doc to understand the concept C:\Users\Lian Li\Desktop\Thewaywithinwithnadia\thewaywithinwithnadia-web\The_Way_Within_Master_Doc_for_Claude.md

# ENGINEERING.md — The Way Within with Nadia

Engineering standards and architecture for the website described in the Master Build Document.
This file governs **how** the code is written. The Master Build Document governs **what** is built.
If you use Claude Code, reference this file from `CLAUDE.md` so every session follows it.

---

## 0. Honest framing

- "No bugs" is not something architecture delivers on its own. It comes from **strict types, validation at every boundary, pure logic that is unit-tested, a real database in integration tests, E2E tests of the money paths, and CI that blocks merges.** This document is built around that.
- "No repeated code" taken literally produces the wrong abstractions, which are worse than duplication. The rule here is: **one source of truth for knowledge** (business rules, tokens, schemas, copy), and **rule of three** for code shape. Two similar JSX blocks are fine; two copies of the slot-calculation logic are not.
- The biggest bug risk in this project is **not the UI**. It is: booking/availability (timezones, DST, double-booking), side effects (calendar, Meet/Zoom, email) and a hand-rolled admin. The architecture below minimizes custom code exactly there.

---

## 1. Stack decision

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript strict** | SSR/SSG, persistent layouts, Server Actions, one deployable. |
| CMS / Admin / Auth | **Payload CMS 3 (runs inside the Next.js app)** | Admin panel, auth, roles, media, drafts and **field-level EN/DE localization** out of the box. Building a custom admin is the largest avoidable source of bugs and maintenance. |
| Database | **PostgreSQL** (Payload Postgres adapter, Drizzle under the hood) | Relational data, transactions, **exclusion constraints** to make double-booking impossible. |
| Styling | **Tailwind CSS v4** with design tokens in `@theme` | One token source; no ad-hoc hex values. |
| UI i18n | **next-intl** (UI strings, routing, `hreflang`) + Payload localization (content) | Clear split: code strings vs. editable content. |
| Validation | **Zod** | Same schema on client and server; inferred types. |
| Email | Provider behind a `Mailer` port (e.g. Resend/Postmark, EU region if possible) | Swappable, fakeable in dev/tests. |
| Calendar / Meet | Google Calendar API (Meet via `conferenceData`) behind `CalendarProvider` | Zoom becomes a second adapter, not a rewrite. |
| Spam | Honeypot + rate limit + Cloudflare Turnstile | Turnstile is lighter and more privacy-friendly than reCAPTCHA. |
| Testing | Vitest, Testcontainers (Postgres), Playwright, axe-core | See §8. |
| Errors | Sentry (EU data region) or equivalent | Visibility in production. |

Hosting: keep everything in an EU region (GDPR). Either Vercel (fra1) + managed Postgres (EU) + S3-compatible storage, or a single VPS with Docker. Decide once; the code does not depend on it.

**Booking: build vs. embed.** A custom booking module (below) is recommended because the spec demands brand-level UX, bilingual flow and admin integration. The alternative is embedding Cal.com — less code, weaker brand control. If timeline is tight, that trade-off is legitimate.

---

## 2. Architecture: modular monolith, feature-first

One app, split into **modules by business capability**, each with internal layers. No microservices.

```
src/
├─ app/
│  ├─ (frontend)/[locale]/            # public routes: home, journey, services, hotels-spas, contact, book
│  ├─ (payload)/                      # Payload admin + REST/GraphQL (generated)
│  └─ api/                            # only webhooks / cron endpoints
├─ modules/
│  ├─ booking/
│  │  ├─ domain/                      # PURE TS: types, slot calculation, state machine, rules
│  │  ├─ application/                 # use cases: createBooking, cancelBooking, rescheduleBooking
│  │  ├─ infrastructure/              # repository (Payload/DB), job handlers
│  │  ├─ ui/                          # BookingFlow, SlotPicker, ...
│  │  ├─ schemas.ts                   # Zod schemas (shared client/server)
│  │  └─ index.ts                     # public API of the module — the ONLY import path
│  ├─ services/                       # service catalogue queries + UI
│  ├─ enquiries/                      # hotels & spas
│  ├─ contact/
│  ├─ content/                        # CMS blocks → React components (page builder)
│  ├─ audio/                          # music player
│  └─ consent/                        # cookie consent + analytics gate
├─ integrations/                      # ports + adapters
│  ├─ calendar/   (port.ts, google.ts, fake.ts)
│  ├─ meetings/   (port.ts, google-meet.ts, zoom.ts, fake.ts)
│  ├─ email/      (port.ts, resend.ts, console.ts, templates/)
│  └─ analytics/  (track.ts)
├─ payload/
│  ├─ collections/  (Services, Bookings, AvailabilityRules, AvailabilityExceptions, Enquiries, Media, Pages, Users)
│  ├─ globals/      (SiteSettings, Navigation, BookingSettings)
│  └─ blocks/       (Hero, Quote, TextImage, Principles, ServicesPreview, CTA, ...)
├─ ui/                                # design system primitives (no business logic)
├─ lib/                               # env.ts, result.ts, errors.ts, logger.ts, dates.ts
├─ i18n/                              # next-intl config, routing, pathnames
└─ messages/                          # en.json, de.json (UI strings only)
tests/
├─ e2e/                               # Playwright
└─ integration/                       # Testcontainers Postgres
```

### Dependency rules (enforced by lint, not by goodwill)

```
app  →  modules (public index only)  →  integrations (ports)  →  lib
                    │
          domain  ← application ← infrastructure / ui
```

- `domain/` imports **nothing** from React, Next, Payload, the DB or `integrations/`. It is plain TypeScript and 100% unit-testable.
- `application/` orchestrates: validates input, calls domain, persists via repository, enqueues side effects. It depends on **ports** (interfaces), never on concrete adapters.
- Modules never import another module's internals — only its `index.ts`.
- `ui/` primitives never fetch data or know about Payload.
- Enforce with `eslint-plugin-boundaries` (or `dependency-cruiser`) in CI.

---

## 3. Single sources of truth (where DRY actually matters)

| Knowledge | Lives in exactly one place |
|---|---|
| Colours, type scale, spacing, radii, motion durations | Tailwind `@theme` tokens (`src/app/globals.css`) |
| Fonts | `next/font` setup in one file, exported as CSS variables |
| Form/input shape & validation | Zod schema in the module's `schemas.ts` — used by the form, the Server Action and the type |
| DB/content types | Generated by Payload (`payload-types.ts`) — never hand-written duplicates |
| Booking rules (min notice, buffer, slot step, timezone) | `BookingSettings` global (editable) → passed into pure domain functions |
| Booking status transitions | `modules/booking/domain/state-machine.ts` |
| Editable copy | Payload (localized fields). Never hard-coded in components. |
| UI microcopy (buttons, errors, labels) | `messages/en.json`, `messages/de.json` |
| Env vars | `lib/env.ts` validated with Zod at boot; app fails fast if missing |
| Analytics events | `integrations/analytics/track.ts` with a typed event union; no raw `gtag()` calls elsewhere |
| SEO metadata | One `buildMetadata()` helper (title, description, canonical, OG, hreflang) used by every route |
| Routes/paths | next-intl `pathnames` config; no string-concatenated URLs |

### Page builder instead of page duplication

Pages are composed of Payload **blocks**. A single registry maps block type → component:

```tsx
// modules/content/render-blocks.tsx
const registry = {
  hero: HeroBlock,
  quote: QuoteBlock,
  textImage: TextImageBlock,
  principles: PrinciplesBlock,
  servicesPreview: ServicesPreviewBlock,
  cta: CtaBlock,
} satisfies Record<Block['blockType'], React.ComponentType<any>>;

export function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((b, i) => {
    const C = registry[b.blockType];
    return <C key={b.id ?? i} {...b} />;
  });
}
```

`satisfies` makes TypeScript fail the build if a new block type has no component. Home, Journey to Self and Hotels & Spas are then data, not code — and Nadia can reorder them.

---

## 4. TypeScript & code rules

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "useUnknownInCatchVariables": true
  }
}
```

Rules:

1. **No `any`**, no non-null `!` assertions, no `as` casts except at validated boundaries. Lint enforces it.
2. **Parse, don't validate.** Everything entering the system (form data, query params, webhooks, API responses from Google/Zoom, env) goes through Zod. Inside, types are trusted.
3. **Make illegal states unrepresentable.** Discriminated unions over boolean flags:
   ```ts
   type SessionMode =
     | { kind: 'in_person'; locationId: string }
     | { kind: 'online'; meetingUrl: string | null };
   ```
4. **Exhaustive switches** with a `never` check, so adding a status/mode breaks the build where handling is missing.
5. **Expected failures are values, not exceptions.** Use cases return `Result<T, DomainError>`; exceptions are for bugs and infrastructure crashes.
   ```ts
   type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
   ```
6. **Server-only code is marked** with `import 'server-only'`. Secrets can never be bundled to the client.
7. **Small functions, explicit names, no clever code.** If a comment explains *what*, rename instead. Comments explain *why*.
8. **No dead code, no commented-out code, no TODO without an issue link.**

---

## 5. Booking module — the critical path

### 5.1 Time handling

- Store **all instants in UTC** (`timestamptz`). Store the business timezone (IANA string) in `BookingSettings`.
- Availability rules are expressed in **local wall time** (e.g. Tue 09:00–13:00 in the business timezone) and converted to UTC per date — never by adding fixed offsets. DST transitions must be covered by tests.
- Show slots to the client in **their** timezone (online sessions) and label it; in-person sessions always show the business timezone.
- Use one date library (e.g. `date-fns` + `date-fns-tz`), wrapped in `lib/dates.ts`. No raw `new Date('...')` string parsing elsewhere.

### 5.2 Slot calculation is a pure function

```ts
// modules/booking/domain/slots.ts
export function computeAvailableSlots(input: {
  range: { from: Date; to: Date };
  now: Date;                       // injected → deterministic tests
  timezone: string;                // business IANA tz
  weeklyRules: WeeklyRule[];       // local wall-time windows
  exceptions: DateException[];     // blocked days / extra hours
  busy: Interval[];                // existing bookings + Google free/busy
  service: { durationMin: number; bufferMin: number };
  minNoticeMin: number;
  stepMin: number;
}): Slot[]
```

No I/O, no clock, no DB. This is where most tests live (§8).

### 5.3 Double-booking prevention — enforced by the database

The UI check is a convenience; the **database is the guarantee**. Add via a migration (adjust column names to the generated schema):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- needed once a practitioner_id is added

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    tstzrange(starts_at, blocked_until, '[)') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed'));
```

`blocked_until` = end + buffer. Two concurrent requests for the same slot: one commits, the other gets a constraint violation, mapped to `SlotTakenError` → the UI asks the user to pick another time. When more practitioners come, add `practitioner_id WITH =` to the constraint.

Additionally, right before insert, re-check Google free/busy so events Nadia created directly in her calendar are respected.

### 5.4 State machine

```ts
// modules/booking/domain/state-machine.ts
const transitions = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['rescheduled', 'cancelled', 'completed', 'no_show'],
  rescheduled: [],   // terminal for this record; the new booking carries on
  cancelled: [],
  completed: [],
  no_show:   [],
} as const satisfies Record<BookingStatus, readonly BookingStatus[]>;
```

All status changes go through one `transition(booking, to)` function. The admin uses it too (via Payload hooks), so there is no second path that skips rules.

### 5.5 Side effects: commit first, then jobs

Never call Google/Zoom/email inside the request that creates the booking.

1. `createBooking` validates, writes the booking in a transaction, **enqueues** jobs (Payload jobs queue or an outbox table), returns.
2. Jobs: `calendar.createEvent` → `meeting.attach` (Meet via `conferenceData.createRequest` with `conferenceDataVersion=1`, or Zoom adapter) → `email.sendConfirmation` → `email.scheduleReminder`.
3. Every job is **idempotent**: it stores its external ID (`calendarEventId`, `meetingUrl`, `confirmationSentAt`) and skips if already done. Retries with backoff. Failures are visible in the admin.

Result: a Google outage never loses a booking, and retries never create duplicate events or emails.

### 5.6 Payments (future)

Add a nullable `payment` relation and a `payment_pending` status later. Do not build it now; do not design anything that assumes bookings are free forever (e.g. keep price snapshot on the booking: `priceAmount`, `currency`).

---

## 6. Integrations: ports & adapters

```ts
// integrations/calendar/port.ts
export interface CalendarProvider {
  getBusy(range: Interval): Promise<Interval[]>;
  createEvent(input: CalendarEventInput): Promise<{ eventId: string; meetUrl?: string }>;
  updateEvent(eventId: string, input: Partial<CalendarEventInput>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
}
```

- Each port has a **fake adapter** used in dev and tests, and real adapters selected in one composition file (`integrations/container.ts`) based on env.
- Missing credentials → app runs with fakes and the admin shows "Google Calendar not connected". This satisfies the spec rule: implement the boundary, mark what is still required, never fabricate.
- External responses are Zod-parsed in the adapter. Nothing raw leaks into modules.

---

## 7. Frontend standards

### 7.1 Server vs. client components

- Default to **Server Components**. `'use client'` only for interactivity (booking flow, forms, audio controls, language switcher, consent banner, mobile nav).
- Keep client components small leaves; pass data down from server components.
- Mutations via **Server Actions** that call the module's application layer; the action itself only parses input and maps `Result` to UI state.

### 7.2 Forms (one pattern for all)

One `useZodForm` hook (React Hook Form + Zod resolver) + one `<FormField>` primitive (label, input, error, description, `aria-describedby`) used by Contact, Enquiry and Booking. Server re-validates with the same schema. Honeypot + Turnstile + rate limit live in one shared `protectPublicAction()` wrapper.

### 7.3 Design system (`src/ui/`)

Primitives only: `Container`, `Section`, `Stack`, `Heading`, `Text`, `Script` (accent font), `Button`/`LinkButton` (variants via `cva`), `Divider` (gold hairline, optional lotus), `Image` (wrapper around `next/image` with required `alt`), `Icon` (fine-line set), `FormField`, `Dialog`.

- Variants with `class-variance-authority`, class merging with `tailwind-merge`. No one-off styling in pages.
- The script font component should make misuse hard: short strings only, never for body or UI.
- Motion: a shared `Reveal` component using CSS + `IntersectionObserver`, honouring `prefers-reduced-motion`. No animation library unless a real need appears.

### 7.4 Music player (persistent across navigation)

- The audio element lives in a **module-level singleton** (`modules/audio/controller.ts`) — not inside a React component. React subscribes via `useSyncExternalStore`. This keeps playback alive across route changes *and* language switches (which remount the `[locale]` layout).
- Starts only after an explicit user gesture ("Begin Your Journey"). Volume fades in.
- User choice (muted/paused) persisted in `localStorage` (wrapped in try/catch).
- **Feature-flagged by `SiteSettings.music.enabled` + an uploaded track.** Until licensing is confirmed, the flag is off and the player renders nothing.
- Controls: real `<button>`s with `aria-pressed` / `aria-label`, keyboard reachable, never covering CTAs on mobile.

### 7.5 i18n

- Routes: `/en/...`, `/de/...` with localized pathnames configured once.
- Language switcher maps the current route to its counterpart (preserves page).
- Every page emits `hreflang` alternates + `x-default` via `buildMetadata()`.
- German content missing → show a clear admin warning; do **not** fall back to machine translation in production.

### 7.6 Analytics & consent

- `track(event)` is the only analytics entry point. Typed union: `book_click | booking_completed | contact_submitted | enquiry_submitted | email_click | phone_click | language_change | music_start`.
- `track` is a no-op until consent is granted. GA4 script is not loaded before consent (Google Consent Mode v2 if used).

---

## 8. Testing strategy

| Layer | Tool | What | Required coverage |
|---|---|---|---|
| Domain | Vitest | Slot calculation, state machine, price/duration rules | Near 100% of branches. DST spring/autumn, min notice, buffers, exceptions, overlapping busy blocks, end-of-day edges. |
| Application + DB | Vitest + Testcontainers Postgres | `createBooking` with real constraints; concurrent double-booking attempt must yield exactly one success | All use cases |
| Adapters | Vitest with recorded fixtures | Google/Zoom response parsing, error mapping | Happy path + error shapes |
| E2E | Playwright (desktop **and** mobile viewport projects) | Book in-person, book online, contact form, enquiry form, language switch preserves page, admin edits a service and it shows on site | Critical paths only |
| Accessibility | `@axe-core/playwright` in E2E | Zero serious/critical violations on every page | All pages |
| Performance | Lighthouse CI | Mobile budgets (LCP, CLS, JS size) | Home, Services, Book |
| Visual | Playwright screenshots (optional) | Hero and booking at 375 / 768 / 1440 | Key screens |

Write the domain test **before** the domain code for anything involving time.

---

## 9. Tooling & CI

- **pnpm**, Node LTS pinned (`.nvmrc` + `engines`).
- ESLint (typescript-eslint strict, boundaries plugin, jsx-a11y, no-floating-promises) + Prettier. Lint errors fail CI; no warnings budget creep.
- Husky + lint-staged: format + lint changed files on commit.
- CI on every PR, in this order, all blocking: `typecheck → lint → unit → integration → build → e2e (+axe) → lighthouse`.
- Preview deployment per PR; production deploy only from `main`.
- Database changes only via **migrations** committed to the repo. Never edit production schema by hand.
- Renovate/Dependabot weekly; security patches merged fast.
- Daily automated DB backups + tested restore (a backup never restored is not a backup).

---

## 10. Security checklist (implementation-level)

- Payload auth for admin; strong password policy; consider 2FA for the admin user. Roles: `admin` (Nadia), `developer`.
- Payload **access control functions** on every collection: public can read only published content and active services; bookings/enquiries are never publicly readable.
- Rate limiting on all public actions and auth endpoints.
- Security headers via `next.config` (CSP, HSTS, `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`).
- Output encoding: rich text rendered through Payload's serializer, never `dangerouslySetInnerHTML` with user input.
- Logs never contain client personal data beyond IDs. Booking/contact data retention period defined and enforced by a scheduled job.

---

## 11. Workflow & Definition of Done (per change)

Branching: short-lived feature branches → PR → squash merge to `main`. Conventional Commits.

A change is done only when:

- [ ] Types pass in strict mode; no new `any`, casts or `eslint-disable`.
- [ ] New logic in `domain/` has unit tests; new use cases have integration tests.
- [ ] Input is Zod-validated at the boundary.
- [ ] No hard-coded editable copy; UI strings exist in **both** `en.json` and `de.json`.
- [ ] Uses design tokens and `ui/` primitives only.
- [ ] Checked at 375px, 768px and 1440px; no horizontal overflow.
- [ ] Keyboard navigable, visible focus, axe clean.
- [ ] No console errors.
- [ ] Side effects are idempotent and run as jobs.
- [ ] Anything waiting on credentials/licensing/content is behind a flag or fake adapter and listed in `PENDING.md`.

---

## 12. Rules for Claude Code sessions

1. Read this file and the Master Build Document before changing code.
2. Inspect existing code before creating anything new — search for an existing primitive, schema or helper first.
3. Put logic in the right layer. If a component starts computing business rules, move them to `domain/`.
4. Do not add dependencies without stating why and what was considered.
5. Do not generate legal text, translations presented as final, music files or credentials.
6. For any change to booking/time logic: write or update the failing test first, then the code.
7. Keep changes small and reviewable; one concern per PR.
8. When something is ambiguous in business terms, stop and list the question instead of inventing an answer.

---

## 13. Build order

1. Repo, tooling, CI, env validation, design tokens, fonts, `ui/` primitives.
2. Payload: collections, globals, localization, access control, media storage.
3. Block registry + Home / Journey to Self / Hotels & Spas pages from CMS data.
4. i18n routing, metadata helper, sitemap, robots, hreflang.
5. Contact + Enquiry (shared form pattern, spam protection, Mailer with fake adapter).
6. Booking domain (tests first) → DB constraint → use cases → jobs → booking UI.
7. Google Calendar + Meet adapter; Zoom only if selected.
8. Consent + analytics; audio player behind flag.
9. Accessibility, performance and mobile hardening pass; production launch checklist from §29 of the Master Build Document.
