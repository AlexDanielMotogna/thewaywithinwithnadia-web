# modules/

Business-capability modules (booking, services, enquiries, contact, content, audio,
consent — see ENGINEERING.md §2). Each module gets `domain/`, `application/`,
`infrastructure/`, `ui/`, `schemas.ts` and an `index.ts` that is the **only** import
path other code may use — enforced by the `boundaries/element-types` ESLint rule in
`eslint.config.mjs`.

Populated starting Phase 4 (contact/enquiries) and Phase 5 (booking) — see
`CHECKLIST.md`.
