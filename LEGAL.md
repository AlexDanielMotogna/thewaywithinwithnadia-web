# LEGAL.md — The Way Within with Nadia

Legal, privacy and accessibility architecture for the website.

> **Companion documents:** [`The_Way_Within_Master_Doc_for_Claude.md`](./The_Way_Within_Master_Doc_for_Claude.md) (what is built) · [`ENGINEERING.md`](./ENGINEERING.md) (how it is built) · [`CLAUDE.md`](./CLAUDE.md) (loads all three).
> This file defines **which legal requirements the code must satisfy and how**. It wins on anything legal, privacy- or accessibility-related; `ENGINEERING.md` wins on technical choices that do not touch these.

**Guiding principle:** MOTOGNA implements the website **following WCAG 2.2 Level AA**, with privacy-by-default under DSGVO/GDPR and Austrian law.
Wording matters: we *follow* WCAG 2.2 AA and *implement* legal pages and consent. We never claim *certified*, *fully compliant* or *legally approved* — that requires an independent audit or a lawyer, and neither is part of the project price.

**Status:** Research note written October 2026 from official sources (listed at the end) and independently fact-checked. This is not legal advice. Anything marked **[CONFIRM]** must be confirmed by Nadia, and anything marked **[LAWYER]** should be checked by a legal professional before launch.

---

## 1. Which laws apply

| Law | Applies to this site? | What it requires from the website | Section |
|---|---|---|---|
| **BaFG** (Barrierefreiheitsgesetz, since 28 Jun 2025) | Online booking tools for consumers are explicitly in scope. **Services of micro-enterprises are exempt** (< 10 employees **and** ≤ EUR 2 m annual turnover *or* balance sheet). Nadia very likely qualifies **[CONFIRM]**. | If exempt: nothing formal (no conformity statement). If not exempt: EN 301 549 accessibility + published conformity information. | §3 |
| **BGStG** (Bundes-Behindertengleichstellungsgesetz) | **Yes, always.** It covers websites that offer goods/services to the public and is not affected by the BaFG exemption. | No discrimination through barriers. Even where full removal would be a disproportionate burden, reasonable measures towards a substantial improvement are expected. Breaches lead to conciliation (Schlichtung) and possible damages, not fines. | §3 |
| **DSGVO / GDPR + DSG** | Yes — contact form, enquiries, bookings, admin users, analytics. | Lawful basis, transparency (privacy policy), minimisation, security, retention, processor agreements, data subject rights. | §4 |
| **TKG 2021 § 165 (3)** | Yes — any cookie, localStorage or similar on the visitor's device. | Prior consent for everything not strictly necessary for a service the user requested. | §5 |
| **ECG § 5** + **MedienG § 25** (+ **UGB § 14** only if in the Firmenbuch) | Yes — commercial website. | Impressum / Offenlegung, reachable from every page. | §6 |
| **ODR Regulation** | **Repealed with effect from 20 Jul 2025.** | **Do not** add the EU OS platform link. Remove it if a template contains it. | §6 |
| **FAGG** (distance contracts with consumers) | Yes — bookings are contracts concluded online. | Pre-contract information, **"Zahlungspflichtig buchen" button for priced bookings (§ 8)**, confirmation on a durable medium, withdrawal-right handling, and the new **online withdrawal function "Vertrag widerrufen" (§ 13a, for contracts concluded after 30 Sep 2026)**. | §7 |
| **UWG** + Humanenergetik advertising rules | Yes, if Nadia's trade is Humanenergetik **[CONFIRM]**. | No healing, relief or success promises, no medical terms. Claude flags copy, Nadia decides. | §8 |
| **GewO** (trade licence scope) | Yes — the services offered must be covered by her licence. | "1:1 Personal Guidance" for people with personal problems may fall under Lebens- und Sozialberatung (§ 119 GewO), a regulated trade **[LAWYER/WKO]**. Affects copy only, not code. | §8 |
| **UrhG** (copyright) + licences | Yes — images, fonts, music, logo. | Only licensed or own assets. Music only after the licence is confirmed. | §9 |

---

## 2. Responsibility split

| Topic | MOTOGNA (Provider) | Nadia (Client) | Lawyer / third party |
|---|---|---|---|
| Accessibility | Builds and tests following WCAG 2.2 AA (§3). | Writes accessible content in the CMS (alt text, headings). | Formal audit and certification, if ever needed (not included). |
| Legal pages | Builds Impressum, Privacy Policy, cookie pages and CMS fields. Can prepare a draft from WKO templates. | Supplies business data. Approves the final texts. | Reviews the texts (recommended). |
| Cookies / consent | Implements the consent banner and blocks scripts until consent. | Decides which optional tools to use (e.g. GA4). | — |
| Data protection | Technical measures (Art. 25/32), data inventory, retention jobs, export/delete tools. | Controller: privacy policy, records of processing (Art. 30), answering data subject requests, breach notification to the DSB. | Optional review. |
| Booking terms (FAGG) | Implements the information, checkboxes and confirmation emails. | Supplies her booking and cancellation conditions (AGB). | Reviews the withdrawal-right handling **[LAWYER]**. |
| Marketing copy | Flags risky wording (§8). | Final decision on all copy. | — |

**Claude Code must never invent legal text, business data, registration numbers or licence statements.** Where content is missing, render a clearly marked placeholder (`[TO BE SUPPLIED BY CLIENT: …]`) and add it to `PENDING.md`.

---

## 3. Accessibility architecture — following WCAG 2.2 AA

### 3.1 Why 2.2 AA

- The harmonised standard behind the BaFG is **EN 301 549**. The version currently cited in the EU Official Journal (V3.2.1) references **WCAG 2.1**. **V4.1.1**, published in September 2026, aligns with **WCAG 2.2 A/AA** and is expected to be cited in the Official Journal around the end of 2026. The WKO already recommends building to WCAG 2.2.
- WCAG 2.2 AA is a superset of 2.1 AA (4.1.1 Parsing was removed as obsolete). For the web content of this site, WCAG 2.2 AA covers the relevant part of EN 301 549. EN 301 549 also has non-web clauses (e.g. documentation and support services), which are not part of this project.
- If Nadia ever stops being a micro-enterprise, the site already meets the bar. Retrofitting later costs more.

### 3.2 Requirements by component

| Component | Requirements (WCAG success criteria) |
|---|---|
| **Global** | `lang="en"` / `lang="de"` per locale and `lang` on mixed-language passages (3.1.1, 3.1.2). Skip link to `<main>`. Landmarks (`header`, `nav`, `main`, `footer`). One `h1` per page and a logical heading order (1.3.1, 2.4.6). Unique, descriptive `<title>` per page (2.4.2). Reflow down to 320 CSS px with no horizontal scroll, and usable at 200 % text zoom (1.4.10, 1.4.4). Text spacing overrides must not break the layout (1.4.12). |
| **Colour & type** | Body text contrast ≥ **4.5:1**, large text ≥ 3:1, UI borders and focus indicators ≥ 3:1 (1.4.3, 1.4.11). **The warm-gold accent fails on ivory backgrounds — use gold for decoration only, never for text or as the only indicator of state.** Olive green on cream is the default text pair, and every pair is verified with a contrast checker. The script font is only for the logo and short decorative phrases; meaning never depends on it. |
| **Navigation** | Fully keyboard-operable, with no keyboard trap (2.1.1, 2.1.2). Visible focus on every interactive element (2.4.7). **The sticky header, cookie banner and music bar must not hide the focused element** (2.4.11 — new in 2.2): use `scroll-padding-top`/`scroll-padding-bottom` equal to their heights. Mobile menu: a `<button>` with `aria-expanded`, focus moves into the menu, closes on `Esc`, focus returns to the trigger. Consistent navigation and help link position on every page (3.2.3, 3.2.6 — new). |
| **Targets** | Interactive targets ≥ **24 × 24 CSS px** or with enough spacing (2.5.8 — new). Aim for 44 × 44 on mobile CTAs, slot buttons and music controls. |
| **Images** | Every image has `alt` set in the CMS (Payload field required; an empty value is allowed only when "decorative" is ticked) (1.1.1). No text inside images. |
| **Motion** | `Reveal` animations and parallax are disabled under `prefers-reduced-motion` (2.3.3 good practice). Nothing that moves for > 5 s without a pause control (2.2.2). No flashing (2.3.1). |
| **Music player** | Never autoplays. It starts only after the explicit "Begin Your Journey" action (1.4.2). Real `<button>` elements: Play/Pause with `aria-pressed` or a changing `aria-label`, plus Mute, and a volume `<input type="range">` with a label. Reachable by keyboard and shown on every page. It must not cover the focused element (2.4.11) and, as a design rule, must not cover CTAs on mobile. The site must be fully usable with audio off. |
| **Forms** (contact, enquiry, booking, admin) | Visible `<label>` for every field. Placeholder is never the label (1.3.1, 3.3.2). Required fields marked in text, not by colour only. `autocomplete` tokens (`name`, `email`, `tel`, `organization`) (1.3.5). Errors listed in text next to the field and in a summary focused on submit, linked with `aria-describedby`, with an announcement via `aria-live="polite"` (3.3.1, 3.3.3, 4.1.3). No time limit, or an adjustable one (2.2.1). Success messages are announced (4.1.3). |
| **Booking flow** | Every step works by keyboard and screen reader. The date picker is a real grid with arrow-key support and `aria-selected`, or a list of `<button>` slots; never a mouse-only widget. **No drag-only interaction** (2.5.7 — new). **Do not ask for the same data twice** within the booking process: carry name and email across steps (3.3.7 — new). Pre-filling them in the reschedule flow is good practice too. Show the timezone in text next to the times. Before the final submit, a review step lets the user check and correct the data (3.3.4). The progress indicator uses text ("Step 2 of 4"), not colour only. |
| **CAPTCHA / spam** | Honeypot and rate limit first. Turnstile in managed/invisible mode. If a challenge is shown, it must have an accessible alternative (1.1.1). Never puzzle-type CAPTCHAs. |
| **Admin login** | Paste allowed, password managers work (`autocomplete="current-password"`), no cognitive tests (3.3.8 — new). |
| **Documents / media** | No PDFs required for the site. If added: tagged, accessible PDFs. Any video needs captions (1.2.2). |

### 3.3 Testing (part of the Definition of Done in `ENGINEERING.md` §11)

- **Automated:** `@axe-core/playwright` on every page and every booking step, in EN and DE. Zero serious or critical violations. Lighthouse accessibility score in CI.
- **Manual, per release:** keyboard-only run of booking, contact, enquiry, music and language switch. Screen reader run with NVDA + Firefox (Windows) and VoiceOver + Safari (iOS). Zoom to 200 % and 400 %. Reduced-motion check. Contrast check of all CMS colour pairs.
- Automated tools catch only part of the issues (published estimates range from about 30 % to 57 %). Manual checks are not optional.

### 3.4 Accessibility statement

- If Nadia is exempt from the BaFG, no conformity statement is legally required.
- Optional, recommended: a short, honest **Accessibility** page saying the site was built following WCAG 2.2 AA, listing known limitations and giving a contact email for barriers. It must **not** claim full conformity unless an audit was done.

---

## 4. Privacy architecture (DSGVO / GDPR)

### 4.1 Roles

- **Nadia = controller.** She decides why and how client data is used.
- **MOTOGNA = processor.** MOTOGNA hosts the website and its data (contract §9), so a **data processing agreement (AVV, Art. 28 GDPR)** between Nadia and MOTOGNA must be signed before launch (contract §9 and §15).
- Third-party processors (hosting, database, email, Cloudflare, Sentry, Google) need their own DPAs. Where possible, the accounts are opened in Nadia's name so she contracts directly. Services that MOTOGNA contracts itself (e.g. its own hosting account) are **sub-processors** and must be authorised by Nadia in the AVV (Art. 28 (2) and (4)).

### 4.2 Data inventory

The source for the privacy policy and for Nadia's records of processing (Art. 30). Keep it up to date in `docs/data-inventory.md` whenever a field or service changes.

| Processing | Data | Lawful basis | Retention (proposal **[CONFIRM]**) | Recipients |
|---|---|---|---|---|
| Contact form | name, email, phone (optional), subject, message | Art. 6(1)(b) pre-contract / (f) legitimate interest | 12 months after last contact | Hosting, DB, email provider |
| Hotels & Spas enquiry | company, contact person, email, phone, location, dates, participants, message | Art. 6(1)(b) | 24 months | Same |
| Booking | name, email, phone, service, date/time, mode, notes, meeting URL, booking language, email-sent timestamps, withdrawal/consent timestamps | Art. 6(1)(b) contract; (c) legal obligation for FAGG records | 24 months after the session; invoice and accounting records 7 years from the end of the calendar year (BAO), longer while proceedings are pending | Hosting, DB, email, Google Calendar/Meet or Zoom |
| Admin users | name, email, password hash, login logs | Art. 6(1)(b)/(f) | While the account exists | Hosting |
| Analytics (GA4, optional) | pseudonymous usage data; the IP address is transmitted to Google but not logged or stored | Art. 6(1)(a) consent + TKG § 165 | GA4 event-data retention set to 2 months (the minimum; applies to explorations, not to aggregated standard reports) | Google (DPF-certified) |
| Error monitoring (Sentry) | technical data; scrub PII | Art. 6(1)(f) | 30–90 days | Sentry (EU region) |
| Server logs | IP, user agent, URL | Art. 6(1)(f) security | ≤ 14 days | Hosting |
| Spam protection (Turnstile) | browser signals, IP | Art. 6(1)(f) | Per Cloudflare | Cloudflare |
| Withdrawal requests (§ 13a FAGG) | name, booking reference, email, timestamp | Art. 6(1)(c) legal obligation | Same as the booking | Hosting, DB, email provider |

### 4.3 Rules for the code

1. **Minimise.** Collect only the fields above. Phone is optional everywhere except where Nadia confirms she needs it.
2. **No special-category data (Art. 9).** Do not add fields about health, conditions, medication, trauma or religious belief. The booking "notes" field gets a short hint: "Please don't share health information here." Never make notes required.
3. **No tracking before consent** (§5). No third-party requests on page load except the site's own origin. **Documented exception:** the Turnstile script, which is loaded only when the user starts interacting with a form (first focus), not on page load, and is listed in the privacy policy.
4. **Self-host all fonts** with `next/font/local` or `next/font/google`, which downloads at build time and serves from our domain. **Never load fonts from `fonts.googleapis.com` at runtime.** In 2022, Austria saw a mass wave of warning letters over exactly this.
5. **No external embeds** (YouTube, Google Maps, Instagram, Spotify) without a click-to-load placeholder that explains the transfer. Use a static map image with a link instead of an embedded Google Map.
6. **EU hosting** for the app, database, file storage, email provider and Sentry where the option exists.
7. **Security (Art. 32):** HTTPS + HSTS, hashed passwords, role-based access, rate limits, CSP, encrypted backups, least-privilege API keys, secrets only in env. See `ENGINEERING.md` §10.
8. **Retention is code, not a promise:** a scheduled job deletes or anonymises records after the retention periods in `RetentionSettings` (Payload global, editable by Nadia).
9. **Data subject rights:** the admin can export (JSON/CSV) and delete all data for a given email address across contact, enquiries and bookings.
10. **Breach readiness:** errors and security events are logged without personal data. MOTOGNA informs Nadia without undue delay, and Nadia notifies the DSB within 72 h if required.
11. **Third-country transfers:** Google, Cloudflare and Sentry Inc. are US companies. Transfers rely on the **EU–US Data Privacy Framework**, which the EU General Court upheld on 3 Sep 2025 (Latombe, T‑553/23). **An appeal is pending at the Court of Justice (C‑703/25 P)**, so the framework could still fall. Before launch, check each provider's DPF certification on dataprivacyframework.gov. Prefer EU-based providers where a choice exists, so a future ruling affects as little as possible.

---

## 5. Cookies and consent (TKG 2021 § 165 (3))

### 5.1 Classification

| Item | Type | Consent? |
|---|---|---|
| Payload admin session cookie | Strictly necessary | No |
| Consent choice (cookie or localStorage) | Strictly necessary | No |
| Locale (if stored) | Strictly necessary for the requested language | No |
| Music preference (paused/muted) | Functional, stores the user's own explicit choice | Treat as necessary **only** if it is written after the user interacts with the player and stores nothing else. List it in the cookie table. |
| Turnstile | Security / anti-spam | Necessary, listed in the privacy policy |
| GA4 (`_ga`, `_ga_*`) | Analytics | **Yes — prior opt-in** |
| Any marketing pixel | Marketing | Yes (none planned) |

### 5.2 Consent banner requirements

- **Accept all**, **Reject all** and **Settings** on the first layer, with **equal visual weight**. Rejecting is as easy as accepting.
- No pre-ticked boxes. Granular categories (Necessary [locked], Analytics).
- Nothing optional loads before a choice. GA4 uses **Consent Mode v2 in basic mode**: the `gtag` script is not loaded at all until analytics consent is given.
- The banner does not block the Impressum and Privacy pages and is fully keyboard- and screen-reader-accessible (a labelled, non-modal region or dialog with proper focus handling). Closing or ignoring the banner is never treated as consent.
- A **"Cookie settings"** link in the footer reopens the dialog. Withdrawing consent is as easy as giving it, and on withdrawal the GA cookies are deleted.
- Store the consent version and timestamp. Increase the version when categories change, which asks again.
- Implemented in `modules/consent`. `track()` in `integrations/analytics` is a no-op without consent (`ENGINEERING.md` §7.6).

---

## 6. Legal pages

### 6.1 Routes and placement

| Page | EN | DE | Notes |
|---|---|---|---|
| Impressum | `/en/imprint` | `/de/impressum` | Linked in the footer of **every** page ("leicht und unmittelbar erreichbar"). |
| Privacy policy | `/en/privacy` | `/de/datenschutz` | Footer + linked next to every form submit button. |
| Cookie settings | dialog | dialog | Footer link. |
| Accessibility (optional) | `/en/accessibility` | `/de/barrierefreiheit` | §3.4. |
| Booking terms / AGB | `/en/terms` | `/de/agb` | Only if Nadia supplies them (§7). |
| Withdraw from contract | `/en/withdraw` | `/de/widerruf` | "Vertrag widerrufen" footer link on every page, no login (§7.5). |

Content comes from a Payload global `LegalSettings` (structured, localized fields) plus rich-text bodies. The legal pages are never part of the block page builder, so nobody deletes them by accident.

### 6.2 Impressum fields for Nadia (sole trader)

Based on the WKO templates "Das korrekte Website-Impressum" (as of August 2025). Use the template for a **sole trader not registered in the Firmenbuch** unless Nadia is an e.U. Every value **[CONFIRM]**:

- Full name, and trade name if any. Company register data (number, court) **only** if she is registered in the Firmenbuch (e.U.).
- If not in the Firmenbuch: **GewO § 63** information — her name and the location of the trade licence (Standort der Gewerbeberechtigung).
- Business purpose (Unternehmensgegenstand).
- Full geographic address of the place of business (no PO box).
- At least two direct contact channels: email + phone.
- If she holds a trade licence: WKO chamber membership, competent trade authority (Gewerbebehörde), applicable trade law (GewO) with a link to ris.bka.gv.at. A professional title only if she holds a special one.
- UID number, if she has one.
- MedienG § 25 (small website): name, business purpose and place of residence or seat (Wohnort/Sitz) of the media owner. **No Blattlinie needed** for a small site that only presents her business.
- **No OS platform link** (repealed 20 Jul 2025).

### 6.3 Privacy policy

Generated from the data inventory (§4.2): controller identity and contact, purposes and lawful bases per processing, recipients and processors, third-country transfers, retention, rights (access, rectification, erasure, restriction, portability, objection, withdrawal of consent), right to complain to the **Österreichische Datenschutzbehörde**, cookie table. In EN and DE. Final text approved by Nadia **[LAWYER]**.

---

## 7. Booking flow — consumer law (FAGG)

Bookings are distance contracts concluded with consumers through an online interface. This applies **today**, whether payment happens online, on site or by invoice.

### 7.1 Before the booking button (§ 4, § 8 (1) FAGG)

Shown on the booking page, and the essential items **directly above the final button**, clearly and prominently:

- service, duration, mode (in person / online), date and time with timezone, location or "link sent by email";
- **total price** (with the VAT note that applies to Nadia — e.g. Kleinunternehmer, no VAT) **[CONFIRM]**;
- Nadia's identity and contact (or a link to the Impressum);
- cancellation and rescheduling conditions (from `BookingSettings`);
- the withdrawal information (§ 7.4 below), including either the 14-day right, or the statement that no withdrawal right exists if an exception applies;
- links to the privacy policy and, if Nadia has them, her booking terms (AGB) with a checkbox.

### 7.2 The final button (§ 8 (2) FAGG)

- For **any booking with a price**, the button must make the payment obligation clear: **"Zahlungspflichtig buchen" / "Book with obligation to pay"**. Wording like "Confirm booking" or "Termin verbindlich buchen" is not enough, and a non-compliant button means the consumer is not bound by the contract.
- Free sessions (price 0) may use a neutral label. The label comes from the service's price, not from a manual setting.

### 7.3 Confirmation (§ 7 (3) FAGG)

Confirmation email (durable medium) with: service, date/time and timezone, price, location or meeting link, Nadia's identity and contact, cancellation and reschedule links, the withdrawal information, the **model withdrawal form**, and a link to the online withdrawal function (§ 7.5).

### 7.4 Withdrawal right — open legal question [LAWYER]

- Online-booked services generally carry a **14-day withdrawal right** from the day the contract is concluded.
- Exception: services connected with **leisure activities** with a fixed date or period (FAGG § 18 (1) 10). Whether meditation, breathwork or 1:1 guidance counts as "leisure" is **not settled**. 1:1 guidance probably does not; a group meditation day might.
- Until a lawyer confirms, implement the safe variant for every session that starts **within 14 days** of booking: **two separate, unticked checkboxes** (WKO recommendation):
  1. "I expressly request that the service begins before the withdrawal period ends."
  2. "I understand that I lose my right of withdrawal once the service has been fully performed."
- The pre-contract information must also say that, if the client withdraws after the session has started, a proportional amount for the part already performed is owed. Without this information the client owes nothing.
- Store both checkbox values with timestamps on the booking.
- If a lawyer confirms the leisure exception, replace the checkboxes with a clear statement that no withdrawal right exists. The information is still mandatory.

### 7.5 Online withdrawal function (§ 13a FAGG, contracts concluded after 30 Sep 2026)

Required for every online distance contract that carries a withdrawal right, so **required here unless the leisure exception is confirmed for all services**:

- A clearly labelled, prominent **"Vertrag widerrufen" / "Withdraw from contract"** link, reachable from every page (footer) and from the confirmation email, **without login**, for the whole withdrawal period.
- It opens a form for: name, booking reference (pre-filled when coming from the email link), and the email address for the receipt. A free-text field allows partial withdrawal.
- The final button reads **"Widerruf bestätigen" / "Confirm withdrawal"**.
- On submit: store the request, cancel the booking (and the calendar event), and send **immediately** a receipt on a durable medium (email) with the content of the withdrawal and the **date and time of receipt**.
- Lives in `modules/booking` (use case `withdrawBooking`) and is covered by E2E tests in EN and DE.

### 7.6 Client self-service

Cancel and reschedule through signed, single-use links in the email (no account needed). Deadlines and any fees come from `BookingSettings` **[CONFIRM]**. This is separate from, and does not replace, the withdrawal function.

### 7.7 Online payments (future)

When online payment is added: same button rule, payment-provider DPA, updated privacy policy, and the refund flow linked to withdrawals.

---

## 8. Marketing copy (UWG / Humanenergetik / GewO)

If Nadia works under the Humanenergetik trade **[CONFIRM]**, the WKO advertising checklist applies:

- **No** healing, relief or success promises. **No** statements about medical treatment.
- **Avoid** medical and therapeutic terms: *Diagnose, Heilung, Therapie, Behandlung von Krankheiten*, and disease names (*Depressionen, Allergien, Kopfschmerzen* …).
- **Avoid** terms reserved for the regulated trade of **Lebens- und Sozialberatung**: *psychologische Beratung, Persönlichkeitsberatung, Ernährungsberatung, (Familien-)Aufstellung* and similar.
- Terms like *Coaching, Beratung, Behandlung* are only acceptable when it is clear that the work is energetic or spiritual.
- Recommended footer or service-page note: the sessions do not replace medical or psychotherapeutic treatment, and for symptoms please see a doctor.

**Copy to flag to Nadia** (the final decision is hers):

- Master Doc §8: breathwork supporting "**nervous-system regulation**" — a physiological effect claim. Suggest: "breath-led practices for grounding, presence and calm".
- Master Doc §7: "**Healing** emotional wounds" — *Heilung* is on the list. Suggest: "making peace with old wounds" or "gently working through what hurts".
- Master Doc §8: "**1:1 Personal Guidance**" for people who "feel lost" — check with WKO whether her licence covers it, or whether it touches Lebens- und Sozialberatung (§ 119 GewO) **[LAWYER/WKO]**. Wording should stay clearly spiritual/energetic.

Claude Code: when generating or seeding copy, never introduce health or effect claims. When copy from the client contains them, keep it but list it in `PENDING.md` under "Copy to review".

---

## 9. Copyright and licences

- **Music** (Sombrio Spirit — Tumbara): not bundled, not uploaded, feature flag off until Nadia provides written proof of a licence that covers website background use.
- **Fonts:** only fonts with a web licence (SIL OFL Google Fonts are fine when self-hosted). Keep licence files in `public/fonts/LICENSES`.
- **Images:**
  - Client-supplied images are her responsibility (contract §6).
  - Placeholders are **only** royalty-free stock with a licence that allows commercial use (Unsplash, Pexels) or AI-generated images. Record the source URL and licence in the Media item's `source` field.
  - **Never** use images copied from other websites, even temporarily.
- **Logo:** recreate it from Nadia's approved direction. Check the licence of any font used inside the logo.

---

## 10. Implementation map

| Requirement | Where in the code (`ENGINEERING.md` §2) |
|---|---|
| Consent banner, categories, versioning | `modules/consent` |
| Analytics gate | `integrations/analytics/track.ts` |
| Legal pages + fields | `payload/globals/LegalSettings`, routes `app/(frontend)/[locale]/{imprint,privacy,terms,accessibility}` |
| Retention job | `payload/globals/RetentionSettings` + scheduled job in `modules/*/infrastructure` |
| Export / delete by email | admin custom view `payload/views/DataSubjectRequests` |
| Booking legal info, button label, checkboxes, confirmation content | `modules/booking/ui`, `modules/booking/application`, `integrations/email/templates` |
| Online withdrawal function (§ 13a FAGG) | `modules/booking` (`withdrawBooking`), route `app/(frontend)/[locale]/withdraw`, footer link |
| Accessible primitives (FormField, Dialog, Button, SkipLink, VisuallyHidden) | `src/ui` |
| Required `alt` on media | `payload/collections/Media` (validation) |
| Media `source`/licence field | `payload/collections/Media` |
| Data inventory | `docs/data-inventory.md` |
| Missing client inputs | `PENDING.md` |

---

## 11. Pre-launch legal checklist

- [ ] Nadia's micro-enterprise status confirmed (BaFG exemption) **[CONFIRM]**
- [ ] Impressum filled with real data (correct WKO template), EN + DE, footer link on every page
- [ ] No OS platform link anywhere
- [ ] Privacy policy approved by Nadia (ideally reviewed by a lawyer), matches the data inventory
- [ ] Consent banner: equal-weight Reject, nothing loads before consent (verified in DevTools → Network with an empty cache)
- [ ] No runtime requests to Google Fonts or other third parties before consent or form interaction
- [ ] AVV between Nadia and MOTOGNA signed if MOTOGNA hosts or maintains; sub-processors listed; provider DPAs accepted
- [ ] DPF status of US providers re-checked (appeal C‑703/25 P)
- [ ] Retention periods confirmed and the job enabled
- [ ] Booking: price and key info directly above the button; **"Zahlungspflichtig buchen"** on priced services
- [ ] Booking: confirmation email contains all § 7.3 items and the model withdrawal form
- [ ] **"Vertrag widerrufen" function live** (§ 7.5), tested end to end, receipt email with date and time
- [ ] Withdrawal-right handling (exception or checkboxes) approved **[LAWYER]**
- [ ] Copy reviewed for health and effect claims and licence scope (§8)
- [ ] Music licence on file, or the player is disabled
- [ ] All placeholder images replaced or documented as licensed
- [ ] Accessibility: axe clean, manual keyboard + screen reader pass, contrast verified
- [ ] Optional accessibility page published with an honest scope

---

## 12. Open questions for Nadia

1. Does she have employees, and is turnover below EUR 2 m? (BaFG exemption — almost certainly yes)
2. Legal form: sole trader with which trade licence (Humanenergetik?), registered in the Firmenbuch (e.U.) or not, UID number?
3. Does her licence cover 1:1 guidance as described, or should the wording change? (ask WKO)
4. Business address for the Impressum (it will be public).
5. Prices: are sessions paid (then "Zahlungspflichtig buchen")? VAT status (Kleinunternehmer)?
6. Cancellation and rescheduling rules (deadline, fees?), and does she want AGB?
7. Does she want Google Analytics at all? Without it, the banner only needs to inform about necessary items — simpler and more private.
8. Which Google account (business) holds Calendar/Meet, and will she use Zoom?
9. Retention periods she is comfortable with.

---

## Sources

- WKO — Barrierefreiheitsgesetz im E-Commerce (FAQ): https://www.wko.at/internetrecht/barrierefreiheitsgesetz-im-e-commerce-faq
- WKO — Barrierefreiheitsgesetz im E-Commerce: https://www.wko.at/internetrecht/barrierefreiheitsgesetz-e-commerce
- Deque — EN 301 549 V4.1.1 is final: https://www.deque.com/blog/en-301-549-v4-1-1-is-final-what-changed-what-it-means-and-what-you-should-do/
- W3C — What's new in WCAG 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- WKO — Das korrekte Website-Impressum, sole trader not in the Firmenbuch (August 2025): https://www.wko.at/oe/internetrecht/das-korrekte-website-impressum-nicht-fb-eingetr-eu.pdf
- WKO — Das korrekte Website-Impressum, e.U. (August 2025): https://www.wko.at/oe/internetrecht/das-korrekte-website-impressum-eu.pdf
- EUR-Lex — Regulation (EU) 2024/3228 (repeal of the ODR platform): https://eur-lex.europa.eu/eli/reg/2024/3228/oj/eng
- RIS — FAGG, current version: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20008847
- WKO — Rücktrittsrecht bei Dienstleistungen im Internet: https://www.wko.at/internetrecht/ruecktrittsrecht-bei-dienstleistungen-im-internet
- WKO — Widerrufsbutton (§ 13a FAGG): https://www.wko.at/internetrecht/e-commerce-widerrufsbutton-webshop
- USP — Verbraucherrechts-Änderungsgesetz 2026: https://www.usp.gv.at/aktuelles/gesetzliche-neuerungen/Bundesgesetzblatt/verbraucherrechtsaenderungsgesetz.html
- WKO Wien — Werbung Humanenergetik (checklist): https://www.wko.at/wien/gewerbe-handwerk/persoenliche-dienstleister/humanenergetiker/info-1x1-werbung-h-energetik.pdf
- RIS — GewO § 119 (Lebens- und Sozialberatung): https://ris.bka.gv.at/Dokumente/Bundesnormen/NOR40032626/NOR40032626.html
- DSB — FAQ zum Thema Cookies und Datenschutz: https://dsb.gv.at/dam/jcr:a6ebcf0b-0874-4aa5-b88d-f79bcce5330c/DSB%20FAQ%20zum%20Thema%20Cookies%20und%20Datenschutz.pdf
- WKO — Abmahnungen Google Fonts: https://www.wko.at/datenschutz/abmahnungen-google-fonts
- EUR-Lex — Appeal C‑703/25 P (Latombe v Commission): https://eur-lex.europa.eu/eli/C/2025/6610/oj/eng
- Google — GA4 data retention: https://support.google.com/analytics/answer/7667196 · IP handling: https://support.google.com/analytics/answer/12017362
- USP — Aufbewahrungspflicht (BAO): https://www.usp.gv.at/themen/steuern-finanzen/steuerliche-gewinnermittlung/weitere-informationen-zur-steuerlichen-gewinnermittlung/betriebliches-rechnungswesen/aufbewahrungspflicht.html
