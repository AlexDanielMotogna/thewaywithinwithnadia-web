# integrations/

Ports & adapters for everything external (calendar, meetings, email, analytics —
ENGINEERING.md §6). Each integration exposes a `port.ts` interface, a fake/console
adapter used in dev and tests, and real adapter(s) selected in one composition file
based on env. Missing credentials → the app runs on fakes and the admin shows a
"not connected" banner; never fabricate a working integration.

- `email/`: console adapter until a provider is chosen (PENDING.md #4).
- `calendar/`: Google Calendar + Meet (`google/`), fake adapter when Google
  was never connected, failing adapter when the connection broke. The
  connection itself (OAuth, encrypted refresh token) lives in
  `modules/calendar`, which passes its state to `calendar/container.ts`, so
  this folder never touches the database.
