# PENDING.md — open items, decisions & blocked work

Referenced by ENGINEERING.md §11 (Definition of Done) and §12 (Claude Code rules).
Anything that depends on credentials, licensing, client content, or a business decision
gets listed here instead of being invented. Update this file whenever such a dependency
is introduced or resolved — do not let it go stale.

Status legend: 🔴 blocking something now · 🟡 needed before launch · 🟢 resolved (keep for history)

---

## 🔴 Decisions needed to keep building

| #   | Item                                                                                                                                                                                                                              | Blocks                                             | Needed from | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------- | ------- |
| 2   | Google Meet vs Zoom (or both) for online sessions                                                                                                                                                                                 | Phase 6 integration work                           | Nadia/Alex  | 🔴 open |
| 3   | Manifestation poem (Journey_to_Self_Introduction.pdf, slide 11) — include on Journey to Self page?                                                                                                                                | Phase 2 content                                    | Alex        | 🔴 open |
| 14  | App hosting (Vercel EU vs VPS) — DB choice is now resolved (Supabase); this is just where the Next.js app itself runs                                                                                                             | Deploy setup (Phase 9, but good to settle earlier) | Alex        | 🔴 open |
| 15  | Supabase project credentials (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PAYLOAD_SECRET`, `S3_*`) — project must be created in an **EU region**. `.env.example`/`.env.local` scaffolded with placeholders, real values still blank | Phase 1 (Payload DB wiring)                        | Alex        | 🔴 open |

## 🟡 Needed before launch (not blocking current work)

| #   | Item                                                                                                                              | Blocks                                                                  | Needed from              | Status            |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------ | ----------------- |
| 4   | Email provider credentials (Resend/Postmark)                                                                                      | Real email sending (Phase 4) — fake/console adapter used until then     | Alex                     | 🟡 pending        |
| 5   | Google Calendar OAuth credentials                                                                                                 | Real calendar sync (Phase 6) — fake adapter used until then             | Nadia                    | 🟡 pending        |
| 6   | Music licensing for "Sombrio Spirit — Tumbara"                                                                                    | Audio player stays feature-flagged OFF until confirmed (Master Doc §14) | Nadia                    | 🟡 pending        |
| 7   | German translations (all pages, forms, emails)                                                                                    | DE locale content — EN ships first, DE structure stays ready            | Nadia/translator         | 🟡 pending        |
| 8   | Legal text: Privacy Policy, Imprint/legal notice, cookie consent copy                                                             | Launch checklist §29                                                    | Nadia/legal professional | 🟡 pending        |
| 9   | Final logo source files (or confirmation to recreate from Presentation - Example.pdf)                                             | Brand asset export (Master Doc §27)                                     | Nadia                    | 🟡 pending        |
| 10  | Cloudflare Turnstile site/secret keys                                                                                             | Spam protection on public forms (Phase 4)                               | Alex                     | 🟡 pending        |
| 11  | GA4 property + Search Console access                                                                                              | Analytics connection (Phase 9)                                          | Nadia                    | 🟡 pending        |
| 12  | Confirmed phone number display format (source: "043 664 3578233" — Austrian mobile; confirm +43 international format for display) | Contact page / SiteSettings                                             | Alex/Nadia               | 🟡 pending        |
| 13  | Payment provider (future) — not building now, but note if a preference exists                                                     | Future phase only                                                       | Nadia                    | 🟢 not needed yet |

---

## Resolved

_(move items here with 🟢 once resolved, keep the row for history)_

| #   | Item                                                                                | Resolution                                                                                                                                                                                                             | Date       |
| --- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Hosting choice — database portion (was: "Hosting choice (Vercel EU vs VPS/Docker)") | **Supabase** (managed Postgres, EU region) — satisfies the exclusion-constraint requirement (§5.3) and the storage requirement via its S3-compatible API (§6). App-hosting portion split out as item #14 (still open). | 2026-10-09 |
