# integrations/

Ports & adapters for everything external (calendar, meetings, email, analytics —
ENGINEERING.md §6). Each integration exposes a `port.ts` interface, a fake/console
adapter used in dev and tests, and real adapter(s) selected in one composition file
based on env. Missing credentials → the app runs on fakes and the admin shows a
"not connected" banner; never fabricate a working integration.

Populated starting Phase 4 (email) and Phase 6 (calendar/meet/zoom) — see
`CHECKLIST.md` and `PENDING.md`.
